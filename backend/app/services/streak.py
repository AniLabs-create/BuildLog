from datetime import date, datetime, timedelta, timezone
from typing import Set, Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.build_log import BuildLog
from app.models.activity import Activity
from app.models.project import Project

def calculate_user_streak(user_id: int, db: Session, tz_offset_minutes: Optional[int] = None) -> Dict[str, Any]:
    """
    Server-side streak calculation engine.
    Calculates consecutive active days for a developer on BuildLog.
    
    Active engineering events included:
      - Creating or updating daily build logs (BuildLog)
      - Project lifecycle events in Activity (project creation, completion, deployment, logs)
      - Projects created by the user (Project)

    Timezone-aware & resilient:
      - Normalizes UTC timestamps into user/system local calendar dates
      - Prevents false-negative drops from timezone boundaries (e.g. UTC date ahead or behind local date)
      - Preserves streak if active today or yesterday, with grace period for late-night / early-morning shifts
      - Accurately tracks historic max (longest_streak)
    """
    # 1. Fetch timestamps of all building activities by this user
    timestamps: List[datetime] = []

    # Daily build logs
    logs = db.query(BuildLog.created_at).filter(BuildLog.user_id == user_id).all()
    for row in logs:
        if row[0]:
            timestamps.append(row[0])

    # Activity stream entries
    acts = db.query(Activity.created_at).filter(Activity.user_id == user_id).all()
    for row in acts:
        if row[0]:
            timestamps.append(row[0])

    # Projects
    projs = db.query(Project.created_at).filter(Project.user_id == user_id).all()
    for row in projs:
        if row[0]:
            timestamps.append(row[0])

    if not timestamps:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "last_activity_date": None,
        }

    # 2. Determine target timezone
    if tz_offset_minutes is not None:
        target_tz = timezone(timedelta(minutes=tz_offset_minutes))
    else:
        # Fall back to host system local timezone
        target_tz = datetime.now().astimezone().tzinfo

    # 3. Convert all timestamps to local calendar dates
    unique_dates: Set[date] = set()
    latest_dt: datetime = max(timestamps)

    for ts in timestamps:
        # If timestamp is naive UTC, localize it first
        if ts.tzinfo is None:
            ts_aware = ts.replace(tzinfo=timezone.utc)
        else:
            ts_aware = ts
        local_ts = ts_aware.astimezone(target_tz)
        unique_dates.add(local_ts.date())

    sorted_dates = sorted(list(unique_dates))
    last_date = sorted_dates[-1]

    # Current local date
    local_now = datetime.now(timezone.utc).astimezone(target_tz)
    today = local_now.date()
    yesterday = today - timedelta(days=1)

    # 4. Calculate Longest Streak (Historic Max)
    longest_streak = 0
    running_streak = 0
    prev_date: Optional[date] = None

    for d in sorted_dates:
        if prev_date is None:
            running_streak = 1
        elif d == prev_date + timedelta(days=1):
            running_streak += 1
        elif d == prev_date:
            continue
        else:
            running_streak = 1

        if running_streak > longest_streak:
            longest_streak = running_streak

        prev_date = d

    # 5. Calculate Current Streak
    current_streak = 0

    # Hours since latest activity
    latest_aware = latest_dt if latest_dt.tzinfo else latest_dt.replace(tzinfo=timezone.utc)
    hours_since_latest = (datetime.now(timezone.utc) - latest_aware).total_seconds() / 3600.0

    if today in unique_dates or last_date >= today:
        # User has logged today (or last_date is ahead due to timezone offset)
        anchor = last_date if last_date >= today else today
        curr = anchor
        while curr in unique_dates:
            current_streak += 1
            curr -= timedelta(days=1)
    elif yesterday in unique_dates or hours_since_latest <= 28.0:
        # User has not logged today yet, but logged yesterday (streak is preserved)
        # or activity occurred within 28 hours
        anchor = yesterday if yesterday in unique_dates else last_date
        curr = anchor
        while curr in unique_dates:
            current_streak += 1
            curr -= timedelta(days=1)
    else:
        # Missed both today and yesterday -> streak has lapsed
        current_streak = 0

    if current_streak > longest_streak:
        longest_streak = current_streak

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_activity_date": last_date.isoformat(),
    }

