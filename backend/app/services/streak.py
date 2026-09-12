from datetime import date, timedelta
from typing import Set
from sqlalchemy.orm import Session
from app.models.build_log import BuildLog

def calculate_user_streak(user_id: int, db: Session) -> dict:
    """
    Server-side streak calculation engine.
    Inspects all unique calendar dates on which the user created at least one build log.

    Returns:
        current_streak: Number of consecutive active calendar days leading up to today/yesterday.
        longest_streak: The maximum consecutive streak ever achieved by this user.
        last_activity_date: The ISO date string of the user's most recent log, or None.
    """
    # Query timestamps of all build logs by this user
    logs = db.query(BuildLog.created_at).filter(BuildLog.user_id == user_id).all()

    if not logs:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "last_activity_date": None,
        }

    # Extract unique calendar dates (as date objects)
    unique_dates: Set[date] = {log[0].date() for log in logs}
    sorted_dates = sorted(list(unique_dates))
    last_date = sorted_dates[-1]

    today = date.today()
    yesterday = today - timedelta(days=1)

    # 1. Calculate Current Streak
    current_streak = 0
    if today in unique_dates:
        # User has logged today
        current_streak = 1
        check_date = yesterday
        while check_date in unique_dates:
            current_streak += 1
            check_date -= timedelta(days=1)
    elif yesterday in unique_dates:
        # User has not logged today yet, but logged yesterday (streak is preserved)
        current_streak = 1
        check_date = yesterday - timedelta(days=1)
        while check_date in unique_dates:
            current_streak += 1
            check_date -= timedelta(days=1)
    else:
        # Missed both today and yesterday -> streak is 0
        current_streak = 0

    # 2. Calculate Longest Streak (Historic Max)
    longest_streak = 0
    running_streak = 0
    prev_date = None

    for d in sorted_dates:
        if prev_date is None:
            running_streak = 1
        elif d == prev_date + timedelta(days=1):
            running_streak += 1
        else:
            running_streak = 1

        if running_streak > longest_streak:
            longest_streak = running_streak

        prev_date = d

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_activity_date": last_date.isoformat(),
    }
