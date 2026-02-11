import datetime
from typing import Any, Dict, List, Optional, Union
import re

def time_to_minutes(time_obj: datetime.time) -> int:
    """
    Convert a time object to minutes since midnight.
    
    Args:
        time_obj: datetime.time object
        
    Returns:
        int: Minutes since midnight (0-1439)
    """
    if not isinstance(time_obj, datetime.time):
        # Handle string conversion if passed accidently, or return 0
        return 0
    
    return time_obj.hour * 60 + time_obj.minute

def minutes_to_time(minutes: int) -> datetime.time:
    """
    Convert minutes since midnight to a time object.
    
    Args:
        minutes: Minutes since midnight (0-1439)
        
    Returns:
        datetime.time: Time object
    """
    # Clamp minutes to valid range
    minutes = max(0, min(1439, int(minutes)))
    
    hour = minutes // 60
    minute = minutes % 60
    
    return datetime.time(hour, minute)

def format_time_duration(minutes: int) -> str:
    """Format duration in minutes to human readable string."""
    hours = minutes // 60
    mins = minutes % 60
    
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}m"
    elif hours > 0:
        return f"{hours}h"
    else:
        return f"{mins}m"
