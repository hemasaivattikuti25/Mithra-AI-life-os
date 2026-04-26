"""
Error Handling Utilities for Frontend

Provides centralized error handling to prevent silent failures.
"""

import logging
from typing import Optional, Callable, Any, Dict

logger = logging.getLogger("mithra.errors")


class MithraError(Exception):
    """Base error class for Mithra."""
    def __init__(self, message: str, code: str = "UNKNOWN", details: Optional[Dict] = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)


class NetworkError(MithraError):
    """Network/API communication error."""
    pass


class ValidationError(MithraError):
    """Input validation error."""
    pass


class AuthenticationError(MithraError):
    """Authentication failed."""
    pass


class PermissionError(MithraError):
    """User lacks permissions."""
    pass


class DataError(MithraError):
    """Data integrity or consistency error."""
    pass


class retry_with_backoff:
    """Decorator to retry failed async operations with exponential backoff."""

    def __init__(
        self,
        max_retries: int = 3,
        initial_delay: float = 0.5,
        max_delay: float = 30.0,
        backoff_factor: float = 2.0,
        on_retry: Optional[Callable] = None
    ):
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.max_delay = max_delay
        self.backoff_factor = backoff_factor
        self.on_retry = on_retry

    def __call__(self, func):
        async def wrapper(*args, **kwargs):
            delay = self.initial_delay
            last_error = None

            for attempt in range(self.max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_error = e

                    if attempt < self.max_retries:
                        if self.on_retry:
                            self.on_retry(attempt + 1, delay, e)

                        logger.warning(
                            f"Attempt {attempt + 1} failed for {func.__name__}: {str(e)}. "
                            f"Retrying in {delay:.1f}s..."
                        )

                        import asyncio
                        await asyncio.sleep(delay)

                        delay = min(delay * self.backoff_factor, self.max_delay)
                    else:
                        logger.error(
                            f"All {self.max_retries + 1} attempts failed for {func.__name__}: {str(e)}"
                        )

            raise last_error

        return wrapper


def handle_api_error(error: Any, context: str = "", default_message: str = None) -> MithraError:
    """Convert API errors into structured MithraErrors."""

    default_message = default_message or "An error occurred. Please try again."

    if isinstance(error, MithraError):
        return error

    if hasattr(error, 'status_code'):
        status = error.status_code
        detail = getattr(error, 'detail', str(error))

        if status == 401:
            return AuthenticationError(
                f"Authentication failed: {detail}",
                code="AUTH_FAILED"
            )
        elif status == 403:
            return PermissionError(
                f"You don't have permission: {detail}",
                code="PERMISSION_DENIED"
            )
        elif status == 404:
            return DataError(
                f"Resource not found: {detail}",
                code="NOT_FOUND"
            )
        elif status == 422:
            return ValidationError(
                f"Invalid data: {detail}",
                code="VALIDATION_ERROR"
            )
        elif status >= 500:
            return NetworkError(
                "Server error. Please try again later.",
                code="SERVER_ERROR"
            )
        else:
            return NetworkError(
                f"Request failed: {detail}",
                code=f"HTTP_{status}"
            )

    error_str = str(error).lower()

    if "network" in error_str or "timeout" in error_str:
        return NetworkError(
            "Network error. Check your connection and try again.",
            code="NETWORK_ERROR"
        )

    if "json" in error_str:
        return DataError(
            "Invalid response format from server",
            code="INVALID_RESPONSE"
        )

    return MithraError(default_message, code="UNKNOWN", details={"original": str(error), "context": context})


def format_error_for_user(error: MithraError) -> str:
    """Format error for display to user."""
    return error.message


def log_error_with_context(error: Any, context: str = "", severity: str = "error"):
    """Log error with context for debugging."""
    if severity == "error":
        logger.error(f"[{context}] {str(error)}", exc_info=True)
    elif severity == "warning":
        logger.warning(f"[{context}] {str(error)}")
    else:
        logger.debug(f"[{context}] {str(error)}")


__all__ = [
    "MithraError",
    "NetworkError",
    "ValidationError",
    "AuthenticationError",
    "PermissionError",
    "DataError",
    "retry_with_backoff",
    "handle_api_error",
    "format_error_for_user",
    "log_error_with_context",
]
