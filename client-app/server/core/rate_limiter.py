import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import jwt

_windows = defaultdict(list)
_last_cleanup = time.time()

RATE_LIMITS = {
    "/api/chat": 20,
    "/api/auth": 10,
}
DEFAULT_LIMIT = 60
WINDOW_SECONDS = 60
CLEANUP_INTERVAL = 300

def _get_limit(path: str) -> int:
    for prefix, limit in RATE_LIMITS.items():
        if path.startswith(prefix):
            return limit
    return DEFAULT_LIMIT

def _cleanup_old(entries: list, now: float) -> list:
    cutoff = now - WINDOW_SECONDS
    return [t for t in entries if t > cutoff]

def _extract_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload.get("user_id") or payload.get("sub")
        except Exception:
            pass
    return None

def _get_real_ip(request: Request) -> str:
    """
    Get the real client IP behind a reverse proxy (Render, Nginx, etc.).
    Reads X-Forwarded-For, falling back to the direct connection IP.
    """
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can be a comma-separated list; leftmost is the original client
        real_ip = forwarded_for.split(",")[0].strip()
        if real_ip:
            return real_ip
    # CF-Connecting-IP (Cloudflare), X-Real-IP (Nginx)
    for header in ("CF-Connecting-IP", "X-Real-IP"):
        ip = request.headers.get(header)
        if ip:
            return ip.strip()
    return request.client.host if request.client else "unknown"

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path == "/" or path.startswith("/docs") or path.startswith("/openapi"):
            return await call_next(request)

        user_id = _extract_user_id(request)
        client_ip = _get_real_ip(request)
        identifier = user_id if user_id else client_ip
        limit = _get_limit(path)

        bucket_prefix = next((p for p in RATE_LIMITS if path.startswith(p)), "default")
        bucket_key = f"{identifier}:{bucket_prefix}"
        now = time.time()

        _windows[bucket_key] = _cleanup_old(_windows[bucket_key], now)

        if len(_windows[bucket_key]) >= limit:
            retry_after = int(WINDOW_SECONDS - (now - _windows[bucket_key][0]))
            return JSONResponse(
                status_code=429,
                content={"detail": f"Rate limit exceeded. Try again in {max(1, retry_after)}s."},
                headers={"Retry-After": str(max(1, retry_after))},
            )

        _windows[bucket_key].append(now)

        global _last_cleanup
        if now - _last_cleanup > CLEANUP_INTERVAL:
            _last_cleanup = now
            stale_keys = [k for k, v in list(_windows.items()) if not v or v[-1] < now - WINDOW_SECONDS * 2]
            for k in stale_keys:
                del _windows[k]

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - len(_windows[bucket_key])))
        return response
