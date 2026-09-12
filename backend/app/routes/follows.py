from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.follow import Follow, FollowRequest
from app.models.notification import Notification
from app.utils.dependencies import get_current_user

router = APIRouter(tags=["follows"])

# Request-scoped router for /follow-requests
requests_router = APIRouter(prefix="/follow-requests", tags=["follows"])


def _is_following(db: Session, follower_id: int, following_id: int) -> bool:
    return (
        db.query(Follow)
        .filter(Follow.follower_id == follower_id, Follow.following_id == following_id)
        .first()
        is not None
    )


def _has_requested(db: Session, requester_id: int, target_id: int) -> bool:
    return (
        db.query(FollowRequest)
        .filter(FollowRequest.requester_id == requester_id, FollowRequest.target_id == target_id)
        .first()
        is not None
    )


def get_follow_state(db: Session, viewer_id: Optional[int], target_user: User) -> str:
    """Viewer's relationship to target: NOT_FOLLOWING | REQUESTED | FOLLOWING | SELF."""
    if viewer_id is None:
        return "NOT_FOLLOWING"
    if viewer_id == target_user.id:
        return "SELF"
    if _is_following(db, viewer_id, target_user.id):
        return "FOLLOWING"
    if _has_requested(db, viewer_id, target_user.id):
        return "REQUESTED"
    return "NOT_FOLLOWING"


@router.post("/users/{username}/follow", status_code=status.HTTP_201_CREATED)
def follow_user(
    username: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Follow a developer.

    - Public account  -> follow takes effect immediately + 'new_follower' notification
    - Private account -> creates a follow request + 'follow_request' notification
    Guards against following yourself and duplicate follows/requests.
    """
    target = db.query(User).filter(User.username == username).first()
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Developer not found.")

    if target.id == current_user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="You cannot follow yourself.")

    if _is_following(db, current_user.id, target.id):
        raise HTTPException(status.HTTP_409_CONFLICT, detail="You are already following this developer.")

    if _has_requested(db, current_user.id, target.id):
        raise HTTPException(status.HTTP_409_CONFLICT, detail="You already have a pending follow request.")

    if target.profile_visibility == "private":
        request = FollowRequest(requester_id=current_user.id, target_id=target.id)
        db.add(request)
        db.add(Notification(
            recipient_id=target.id,
            actor_id=current_user.id,
            type="follow_request",
        ))
        db.commit()
        return {"status": "REQUESTED", "message": f"Follow request sent to @{target.username}."}

    follow = Follow(follower_id=current_user.id, following_id=target.id)
    db.add(follow)
    db.add(Notification(
        recipient_id=target.id,
        actor_id=current_user.id,
        type="new_follower",
    ))
    db.commit()
    return {"status": "FOLLOWING", "message": f"You are now following @{target.username}."}


@router.delete("/users/{username}/follow", status_code=status.HTTP_200_OK)
def unfollow_or_cancel(
    username: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Unfollow a developer — or, if a follow request is still pending,
    cancel that request. One endpoint for both "Following" and "Requested" states.
    """
    target = db.query(User).filter(User.username == username).first()
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Developer not found.")

    follow = (
        db.query(Follow)
        .filter(Follow.follower_id == current_user.id, Follow.following_id == target.id)
        .first()
    )
    if follow:
        db.delete(follow)
        db.commit()
        return {"status": "NOT_FOLLOWING", "message": f"Unfollowed @{target.username}."}

    request = (
        db.query(FollowRequest)
        .filter(FollowRequest.requester_id == current_user.id, FollowRequest.target_id == target.id)
        .first()
    )
    if request:
        db.delete(request)
        db.commit()
        return {"status": "NOT_FOLLOWING", "message": f"Follow request to @{target.username} cancelled."}

    raise HTTPException(status.HTTP_404_NOT_FOUND, detail="You are not following this developer.")


def _serialize_requester(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
    }


def _serialize_follow_request(request: FollowRequest, requester: User) -> dict:
    return {
        "id": request.id,
        "created_at": request.created_at.isoformat(),
        "requester": _serialize_requester(requester),
    }


@requests_router.get("", response_model=List[dict])
def list_follow_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """All pending follow requests TO the current user, newest first."""
    rows = (
        db.query(FollowRequest, User)
        .join(User, FollowRequest.requester_id == User.id)
        .filter(FollowRequest.target_id == current_user.id)
        .order_by(FollowRequest.created_at.desc())
        .all()
    )
    return [
        _serialize_follow_request(request, requester)
        for request, requester in rows
    ]


@requests_router.post("/{request_id}/accept")
def accept_follow_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accept a pending follow request: creates the real follow relationship
    and notifies the requester that it was accepted.
    """
    request = db.query(FollowRequest).filter(FollowRequest.id == request_id).first()
    if not request:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Follow request not found.")

    if request.target_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="This follow request is not addressed to you.")

    already = _is_following(db, request.requester_id, current_user.id)
    if not already:
        db.add(Follow(follower_id=request.requester_id, following_id=current_user.id))

    db.add(Notification(
        recipient_id=request.requester_id,
        actor_id=current_user.id,
        type="follow_accepted",
    ))
    db.delete(request)
    db.commit()
    return {"status": "FOLLOWING", "message": "Follow request accepted."}


@requests_router.post("/{request_id}/decline")
def decline_follow_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Decline (delete) a pending follow request addressed to you."""
    request = db.query(FollowRequest).filter(FollowRequest.id == request_id).first()
    if not request:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Follow request not found.")

    if request.target_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="This follow request is not addressed to you.")

    db.delete(request)
    db.commit()
    return {"status": "DECLINED", "message": "Follow request declined."}


@router.get("/users/{username}/followers", response_model=List[dict])
def list_followers(username: str, db: Session = Depends(get_db)):
    """Public list of who follows this developer."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Developer not found.")

    rows = (
        db.query(User)
        .join(Follow, Follow.follower_id == User.id)
        .filter(Follow.following_id == user.id)
        .order_by(Follow.created_at.desc())
        .all()
    )
    return [_serialize_requester(u) for u in rows]


@router.get("/users/{username}/following", response_model=List[dict])
def list_following(username: str, db: Session = Depends(get_db)):
    """Public list of who this developer follows."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Developer not found.")

    rows = (
        db.query(User)
        .join(Follow, Follow.following_id == User.id)
        .filter(Follow.follower_id == user.id)
        .order_by(Follow.created_at.desc())
        .all()
    )
    return [_serialize_requester(u) for u in rows]
