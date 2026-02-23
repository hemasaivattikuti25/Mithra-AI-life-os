"""
Rate Limiter Middleware for Mithra API

Lightweight, in-memory sliding-window rate limiter.
No external dependencies (no Redis required).

Limits:
  - AI endpoints (/api/chat):  20 requests per minute per IP
  - Auth endpoints (/api/auth): 10 requests per minute per IP
  - Default:                    60 requests per minute per IP
"""

import time
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

# Sliding window store: { "ip:bucket" -> [timestamp, ...] }
_windows = defaultdict(list)

# Limits per path prefix (requests per 60 seconds)
RATE_LIMITS = {
    "/api/chat": 20,
    "/api/auth": 10,
}
DEFAULT_LIMIT = 60
WINDOW_SECONDS = 60


def _get_limit(path: str) -> int:
    """Get the rate limit for a given path."""
    for prefix, limit in RATE_LIMITS.items():
        if path.startswith(prefix):
            return limit
    return DEFAULT_LIMIT


def _cleanup_old(entries: list, now: float) -> list:
    """Remove entries older than the window."""
    cutoff = now - WINDOW_SECONDS
    return [t for t in entries if t > cutoff]


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and static files
        path = request.url.path
        if path == "/" or path.startswith("/docs") or path.startswith("/openapi"):
            return await call_next(request)

        # Identify client
        client_ip = request.client.host if request.client else "unknown"
        limit = _get_limit(path)

        # Determine bucket: group by IP + path prefix
        bucket_prefix = next(
            (p for p in RATE_LIMITS if path.startswith(p)),
            "default"
        )
        bucket_key = f"{client_ip}:{bucket_prefix}"

        now = time.time()

        # Clean old entries and check count
        _windows[bucket_key] = _cleanup_old(_windows[bucket_key], now)

        if len(_windows[bucket_key]) >= limit:
            retry_after = int(WINDOW_SECONDS - (now - _windows[bucket_key][0]))
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again in {max(1, retry_after)}s.",
                headers={"Retry-After": str(max(1, retry_after))},
            )

        # Record this request
        _windows[bucket_key].append(now)

        # Periodic cleanup (every 100 requests, prune stale buckets)
        if sum(len(v) for v in _windows.values()) % 100 == 0:
            stale_keys = [
                k for k, v in _windows.items()
                if not v or v[-1] < now - WINDOW_SECONDS * 2
            ]
            for k in stale_keys:
                del _windows[k]

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, limit - len(_windows[bucket_key]))
        )
        return response
