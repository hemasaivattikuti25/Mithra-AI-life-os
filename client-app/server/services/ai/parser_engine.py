"""
═══════════════════════════════════════════════════════════════════════════════
PARSER ENGINE — Converts natural language to structured data.

Handles ALL natural language → structured data conversion:
  • Task parsing
  • Event parsing
  • Habit parsing
  • Date resolution
═══════════════════════════════════════════════════════════════════════════════
"""
import re
import logging
from datetime import date, datetime, timedelta
from typing import Optional

from . import ai_gateway

logger = logging.getLogger("mithra.parser_engine")


# ─── Date Resolution Helper ──────────────────────────────────────────────────

def calculate_actual_date(relative_text: str, from_date: Optional[date] = None) -> Optional[date]:
    """
    Convert relative date text to an actual date.

    Handles:
        - "today", "tomorrow", "yesterday"
        - "next week", "next month"
        - Day names: "monday", "next monday"
        - Specific dates: "March 15", "15th"

    Args:
        relative_text: The relative date string
        from_date: Reference date (defaults to today)

    Returns:
        date object or None if unparseable
    """
    if from_date is None:
        from_date = date.today()

    text = relative_text.lower().strip()

    # Simple relatives
    if text == "today":
        return from_date
    if text in ("tomorrow", "tmrw", "tmw"):
        return from_date + timedelta(days=1)
    if text == "yesterday":
        return from_date - timedelta(days=1)

    # "in X days"
    match = re.search(r"in\s+(\d+)\s+days?", text)
    if match:
        return from_date + timedelta(days=int(match.group(1)))

    # "next week"
    if "next week" in text:
        return from_date + timedelta(days=7)

    # "next month"
    if "next month" in text:
        next_month = from_date.month + 1
        year = from_date.year
        if next_month > 12:
            next_month = 1
            year += 1
        return date(year, next_month, min(from_date.day, 28))

    # Day names
    days = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6,
        "mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6,
    }

    for day_name, day_num in days.items():
        if day_name in text:
            current_day = from_date.weekday()
            days_ahead = day_num - current_day
            if "next" in text:
                days_ahead += 7
            elif days_ahead <= 0:
                days_ahead += 7
            return from_date + timedelta(days=days_ahead)

    # Month + day: "March 15", "15th of March"
    months = {
        "january": 1, "february": 2, "march": 3, "april": 4,
        "may": 5, "june": 6, "july": 7, "august": 8,
        "september": 9, "october": 10, "november": 11, "december": 12,
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
    }

    for month_name, month_num in months.items():
        if month_name in text:
            # Find the day number
            day_match = re.search(r"(\d{1,2})", text)
            if day_match:
                day = int(day_match.group(1))
                day = min(max(day, 1), 31)
                year = from_date.year
                # If the date is in the past, use next year
                try:
                    result = date(year, month_num, day)
                    if result < from_date:
                        result = date(year + 1, month_num, day)
                    return result
                except ValueError:
                    pass

    return None


def extract_time_from_text(text: str) -> Optional[str]:
    """
    Extract time from natural language.

    Returns: "HH:MM" format or None
    """
    text = text.lower()

    # "at 3pm", "at 3:30pm", "at 15:00"
    patterns = [
        r"at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?",
        r"(\d{1,2}):(\d{2})\s*(am|pm)?",
        r"(\d{1,2})\s*(am|pm)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            groups = match.groups()
            hour = int(groups[0])
            minute = int(groups[1]) if groups[1] else 0
            period = groups[-1] if len(groups) > 1 else None

            # Handle AM/PM
            if period == "pm" and hour < 12:
                hour += 12
            elif period == "am" and hour == 12:
                hour = 0

            return f"{hour:02d}:{minute:02d}"

    # Word-based times
    time_words = {
        "morning": "09:00", "noon": "12:00", "afternoon": "14:00",
        "evening": "18:00", "night": "20:00", "midnight": "00:00",
    }
    for word, time_val in time_words.items():
        if word in text:
            return time_val

    return None


def extract_priority_from_text(text: str) -> str:
    """Extract priority level from text."""
    text = text.lower()

    if any(word in text for word in ["urgent", "asap", "critical", "high priority", "important"]):
        return "high"
    if any(word in text for word in ["low priority", "whenever", "not urgent", "eventually"]):
        return "low"

    return "medium"


# ─── Main Parsing Functions ──────────────────────────────────────────────────

async def parse_task_from_text(text: str, today: Optional[str] = None) -> dict:
    """
    Parse natural language into a task structure.

    Input: "Meet Rahul tomorrow at 4pm, high priority"
    Output: {
        "title": "Meet Rahul",
        "due_date": "2026-03-05",
        "due_time": "16:00",
        "priority": "high",
        "confidence": 0.9
    }
    """
    today = today or date.today().isoformat()

    try:
        result = await ai_gateway.parse_natural_language(
            text=text,
            parse_type="task",
            today=today,
            max_tokens=150,
        )

        # Validate and clean up
        if not result.get("title"):
            result["title"] = text[:50]  # Fallback to input

        result["confidence"] = result.get("confidence", 0.8)
        return result

    except Exception as e:
        logger.warning(f"AI parse failed, using regex fallback: {e}")

        # Fallback: regex-based parsing
        due_date = None
        due_time = extract_time_from_text(text)
        priority = extract_priority_from_text(text)

        # Try to extract date
        date_patterns = [
            r"(tomorrow|today|next week|next month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)",
            r"(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}",
        ]

        for pattern in date_patterns:
            match = re.search(pattern, text.lower())
            if match:
                parsed_date = calculate_actual_date(match.group(0), date.fromisoformat(today))
                if parsed_date:
                    due_date = parsed_date.isoformat()
                    break

        # Clean title (remove date/time/priority words)
        title = text
        for word in ["tomorrow", "today", "urgent", "high priority", "low priority", "asap"]:
            title = re.sub(rf"\b{word}\b", "", title, flags=re.IGNORECASE)
        title = re.sub(r"at\s+\d{1,2}:\d{2}\s*(am|pm)?", "", title, flags=re.IGNORECASE)
        title = re.sub(r"at\s+\d{1,2}\s*(am|pm)", "", title, flags=re.IGNORECASE)
        title = " ".join(title.split()).strip()

        return {
            "title": title or text[:50],
            "due_date": due_date,
            "due_time": due_time,
            "priority": priority,
            "confidence": 0.6,
        }


async def parse_habit_from_text(text: str) -> dict:
    """
    Parse natural language into a habit definition.

    Input: "meditate every morning for 10 minutes"
    Output: {
        "name": "Meditation",
        "frequency": "daily",
        "time_of_day": "morning",
        "duration_minutes": 10,
        "category": "Mindfulness"
    }
    """
    try:
        result = await ai_gateway.parse_natural_language(
            text=text,
            parse_type="habit",
            max_tokens=150,
        )

        # Validate
        if not result.get("name"):
            result["name"] = text[:30].title()

        return result

    except Exception as e:
        logger.warning(f"AI parse failed, using regex fallback: {e}")

        # Regex fallback
        name = text[:30].title()
        frequency = "daily"
        time_of_day = "anytime"
        duration = 15
        category = "Personal"

        # Extract frequency
        if any(word in text.lower() for word in ["every day", "daily", "each day"]):
            frequency = "daily"
        elif any(word in text.lower() for word in ["weekly", "every week", "once a week"]):
            frequency = "weekly"

        # Extract time of day
        if "morning" in text.lower():
            time_of_day = "morning"
        elif "evening" in text.lower() or "night" in text.lower():
            time_of_day = "evening"
        elif "afternoon" in text.lower():
            time_of_day = "afternoon"

        # Extract duration
        duration_match = re.search(r"(\d+)\s*min", text.lower())
        if duration_match:
            duration = int(duration_match.group(1))

        # Extract category hints
        if any(word in text.lower() for word in ["exercise", "gym", "run", "workout", "walk"]):
            category = "Health"
        elif any(word in text.lower() for word in ["read", "learn", "study", "book"]):
            category = "Learning"
        elif any(word in text.lower() for word in ["meditate", "journal", "gratitude", "breathe"]):
            category = "Mindfulness"
        elif any(word in text.lower() for word in ["code", "work", "project"]):
            category = "Productivity"

        return {
            "name": name,
            "frequency": frequency,
            "time_of_day": time_of_day,
            "duration_minutes": duration,
            "category": category,
        }


async def parse_event_from_text(text: str, today: Optional[str] = None) -> dict:
    """
    Parse natural language into a calendar event.

    Input: "team standup Monday 9am for 30 minutes"
    Output: {
        "title": "Team Standup",
        "start": "2026-03-09T09:00:00",
        "end": "2026-03-09T09:30:00",
        "category": "Work"
    }
    """
    today = today or date.today().isoformat()

    try:
        result = await ai_gateway.parse_natural_language(
            text=text,
            parse_type="event",
            today=today,
            max_tokens=150,
        )

        # Validate
        if not result.get("title"):
            result["title"] = text[:30].title()

        return result

    except Exception as e:
        logger.warning(f"AI parse failed, using regex fallback: {e}")

        # Regex fallback
        event_date = date.fromisoformat(today)
        start_time = "09:00"
        duration_minutes = 60

        # Extract date
        date_patterns = [
            r"(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)",
        ]
        for pattern in date_patterns:
            match = re.search(pattern, text.lower())
            if match:
                parsed_date = calculate_actual_date(match.group(0), event_date)
                if parsed_date:
                    event_date = parsed_date
                    break

        # Extract time
        extracted_time = extract_time_from_text(text)
        if extracted_time:
            start_time = extracted_time

        # Extract duration
        duration_match = re.search(r"for\s+(\d+)\s*(min|hour)", text.lower())
        if duration_match:
            num = int(duration_match.group(1))
            unit = duration_match.group(2)
            duration_minutes = num * 60 if "hour" in unit else num

        # Calculate end time
        start_dt = datetime.combine(event_date, datetime.strptime(start_time, "%H:%M").time())
        end_dt = start_dt + timedelta(minutes=duration_minutes)

        # Clean title
        title = text
        for word in ["tomorrow", "today", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
            title = re.sub(rf"\b{word}\b", "", title, flags=re.IGNORECASE)
        title = re.sub(r"at\s+\d{1,2}:\d{2}\s*(am|pm)?", "", title, flags=re.IGNORECASE)
        title = re.sub(r"for\s+\d+\s*(min|hour|minutes|hours)", "", title, flags=re.IGNORECASE)
        title = " ".join(title.split()).strip()

        # Category
        category = "Personal"
        if any(word in text.lower() for word in ["meeting", "standup", "call", "work", "team"]):
            category = "Work"
        elif any(word in text.lower() for word in ["doctor", "dentist", "appointment"]):
            category = "Health"

        return {
            "title": title.title() or "Event",
            "start": start_dt.isoformat(),
            "end": end_dt.isoformat(),
            "category": category,
        }
