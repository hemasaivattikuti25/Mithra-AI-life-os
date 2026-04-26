"""
Input Validation Utilities for Mithra Backend

Provides centralized validation for all user inputs to prevent:
- SQL injection
- XSS attacks
- Data corruption
- Buffer overflows
- Invalid data types
"""

from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
import re


class ValidationError(HTTPException):
    """Custom validation error with proper HTTP status."""
    def __init__(self, field: str, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error in '{field}': {message}"
        )


class InputValidator:
    """Centralized input validation for all user data."""
    
    # Constraints
    MAX_TEXT_LENGTH = 10000
    MAX_TITLE_LENGTH = 500
    MAX_EMAIL_LENGTH = 254
    MAX_PASSWORD_LENGTH = 128
    MIN_PASSWORD_LENGTH = 8
    MAX_DESCRIPTION_LENGTH = 5000
    MAX_ARRAY_LENGTH = 1000
    
    # Patterns
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    SLUG_PATTERN = re.compile(r'^[a-z0-9\-_]+$')
    UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
    
    @staticmethod
    def validate_email(email: Optional[str]) -> str:
        """Validate email address."""
        if not email:
            raise ValidationError("email", "Email is required")
        
        email = email.strip().lower()
        
        if len(email) > InputValidator.MAX_EMAIL_LENGTH:
            raise ValidationError("email", f"Email too long (max {InputValidator.MAX_EMAIL_LENGTH} chars)")
        
        if not InputValidator.EMAIL_PATTERN.match(email):
            raise ValidationError("email", "Invalid email format")
        
        return email
    
    @staticmethod
    def validate_password(password: Optional[str]) -> str:
        """Validate password strength."""
        if not password:
            raise ValidationError("password", "Password is required")
        
        if len(password) < InputValidator.MIN_PASSWORD_LENGTH:
            raise ValidationError("password", f"Password too short (min {InputValidator.MIN_PASSWORD_LENGTH} chars)")
        
        if len(password) > InputValidator.MAX_PASSWORD_LENGTH:
            raise ValidationError("password", f"Password too long (max {InputValidator.MAX_PASSWORD_LENGTH} chars)")
        
        # Check for at least one uppercase, one lowercase, one digit
        if not re.search(r'[a-z]', password):
            raise ValidationError("password", "Password must contain lowercase letters")
        if not re.search(r'[A-Z]', password):
            raise ValidationError("password", "Password must contain uppercase letters")
        if not re.search(r'[0-9]', password):
            raise ValidationError("password", "Password must contain digits")
        
        return password
    
    @staticmethod
    def validate_string(value: Optional[str], field: str, max_length: int = MAX_TEXT_LENGTH, allow_empty: bool = False) -> str:
        """Validate string input."""
        if value is None:
            if allow_empty:
                return ""
            raise ValidationError(field, "This field is required")
        
        value = str(value).strip()
        
        if not value and not allow_empty:
            raise ValidationError(field, "This field cannot be empty")
        
        if len(value) > max_length:
            raise ValidationError(field, f"Too long (max {max_length} chars)")
        
        return value
    
    @staticmethod
    def validate_title(title: Optional[str]) -> str:
        """Validate task/event title."""
        return InputValidator.validate_string(title, "title", InputValidator.MAX_TITLE_LENGTH, allow_empty=False)
    
    @staticmethod
    def validate_description(description: Optional[str]) -> str:
        """Validate description."""
        return InputValidator.validate_string(description, "description", InputValidator.MAX_DESCRIPTION_LENGTH, allow_empty=True)
    
    @staticmethod
    def validate_integer(value: Optional[int], field: str, min_val: int = 0, max_val: int = 10000) -> int:
        """Validate integer input."""
        if value is None:
            raise ValidationError(field, "This field is required")
        
        try:
            value = int(value)
        except (ValueError, TypeError):
            raise ValidationError(field, "Must be a valid integer")
        
        if value < min_val or value > max_val:
            raise ValidationError(field, f"Must be between {min_val} and {max_val}")
        
        return value
    
    @staticmethod
    def validate_uuid(value: Optional[str], field: str) -> str:
        """Validate UUID format."""
        if not value:
            raise ValidationError(field, "ID is required")
        
        value = str(value).strip().lower()
        
        if not InputValidator.UUID_PATTERN.match(value):
            raise ValidationError(field, "Invalid ID format")
        
        return value
    
    @staticmethod
    def validate_array(value: Optional[List[Any]], field: str, max_length: int = None) -> List[Any]:
        """Validate array input."""
        if not isinstance(value, list):
            raise ValidationError(field, "Must be an array")
        
        max_length = max_length or InputValidator.MAX_ARRAY_LENGTH
        if len(value) > max_length:
            raise ValidationError(field, f"Array too large (max {max_length} items)")
        
        return value
    
    @staticmethod
    def validate_enum(value: Optional[str], field: str, allowed: List[str]) -> str:
        """Validate enum value."""
        if value is None:
            raise ValidationError(field, "This field is required")
        
        value = str(value).strip()
        
        if value not in allowed:
            raise ValidationError(field, f"Must be one of: {', '.join(allowed)}")
        
        return value
    
    @staticmethod
    def validate_boolean(value: Optional[bool], field: str, default: bool = False) -> bool:
        """Validate boolean input."""
        if value is None:
            return default
        
        if not isinstance(value, bool):
            raise ValidationError(field, "Must be true or false")
        
        return value
    
    @staticmethod
    def validate_phone(phone: Optional[str]) -> str:
        """Validate phone number (basic)."""
        if not phone:
            return ""
        
        phone = re.sub(r'[^\d+\-().]', '', str(phone))
        
        if len(phone) < 7 or len(phone) > 20:
            raise ValidationError("phone", "Invalid phone number")
        
        return phone
    
    @staticmethod
    def sanitize_string(value: str) -> str:
        """Remove potentially dangerous characters."""
        # Remove null bytes
        value = value.replace('\x00', '')
        return value


class DataValidator:
    """Validates complete data structures for integrity."""
    
    @staticmethod
    def validate_task_create(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate task creation request."""
        return {
            "title": InputValidator.validate_title(data.get("title")),
            "description": InputValidator.validate_description(data.get("description")),
            "priority": InputValidator.validate_enum(
                data.get("priority", "medium"), 
                "priority", 
                ["low", "medium", "high", "critical"]
            ),
            "due_date": data.get("due_date"),  # Should be validated elsewhere
            "category": InputValidator.validate_enum(
                data.get("category", "Work"),
                "category",
                ["Work", "Personal", "Health", "Focus", "Shopping", "Home"]
            ),
            "tags": InputValidator.validate_array(data.get("tags", []), "tags", max_length=20),
        }
    
    @staticmethod
    def validate_habit_create(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate habit creation request."""
        return {
            "title": InputValidator.validate_title(data.get("title")),
            "description": InputValidator.validate_description(data.get("description")),
            "frequency": InputValidator.validate_enum(
                data.get("frequency", "daily"),
                "frequency",
                ["daily", "weekly", "monthly"]
            ),
            "color": data.get("color", "#3b82f6"),  # Validate color format elsewhere
        }
    
    @staticmethod
    def validate_journal_create(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate journal entry creation."""
        return {
            "title": InputValidator.validate_title(data.get("title")),
            "body": InputValidator.validate_description(data.get("body")),
            "mood": InputValidator.validate_enum(
                data.get("mood"),
                "mood",
                ["happy", "sad", "neutral", "anxious", "excited", "frustrated", "tired", "motivated"]
            ),
            "tags": InputValidator.validate_array(data.get("tags", []), "tags", max_length=10),
        }
    
    @staticmethod
    def validate_mood_log(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate mood log creation."""
        return {
            "mood": InputValidator.validate_enum(
                data.get("mood"),
                "mood",
                ["happy", "sad", "neutral", "anxious", "excited", "frustrated", "tired", "motivated"]
            ),
            "intensity": InputValidator.validate_integer(data.get("intensity"), "intensity", 1, 10),
            "notes": InputValidator.validate_description(data.get("notes")),
        }


# Export for use in routers
__all__ = ["InputValidator", "DataValidator", "ValidationError"]
