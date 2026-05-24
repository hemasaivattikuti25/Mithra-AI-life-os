"""
Backend smoke tests — run in CI without a real DB/Firebase.
Tests route registrations, validator logic, rate limiter IP extraction.
"""
import pytest
from unittest.mock import patch, MagicMock


# ─── Validators ───────────────────────────────────────────────────────────────
class TestValidators:
    def setup_method(self):
        from core.validators import InputValidator
        self.v = InputValidator

    def test_validate_string_normal(self):
        assert self.v.validate_string("hello", "title") == "hello"

    def test_validate_string_strips(self):
        assert self.v.validate_string("  hello  ", "title") == "hello"

    def test_validate_string_max_length(self):
        from core.validators import ValidationError
        with pytest.raises(ValidationError):
            self.v.validate_string("x" * 600, "title", max_length=500)

    def test_validate_string_min_length(self):
        from core.validators import ValidationError
        with pytest.raises(ValidationError):
            self.v.validate_string("", "title", min_length=1)

    def test_validate_enum_valid(self):
        assert self.v.validate_enum("high", "priority", ["low", "medium", "high"]) == "high"

    def test_validate_enum_invalid(self):
        from core.validators import ValidationError
        with pytest.raises(ValidationError):
            self.v.validate_enum("urgent", "priority", ["low", "medium", "high"])

    def test_validate_array_empty(self):
        assert self.v.validate_array(None, "subtasks") == []

    def test_validate_uuid_valid(self):
        import uuid
        uid = str(uuid.uuid4())
        assert self.v.validate_uuid(uid, "id") == uid

    def test_validate_uuid_invalid(self):
        from core.validators import ValidationError
        with pytest.raises(ValidationError):
            self.v.validate_uuid("not-a-uuid", "id")

    def test_validate_field_name_aliases(self):
        assert self.v.validate_string("hello", field_name="title") == "hello"
        assert self.v.validate_integer("3", field_name="mood", min_value=1, max_value=5) == 3
        assert self.v.validate_array(["a"], field_name="tags", max_length=3) == ["a"]

    def test_validate_enum_allowed_list_with_field_name(self):
        assert self.v.validate_enum("Work", ["Work", "Personal"], field_name="category") == "Work"


# ─── Rate Limiter ─────────────────────────────────────────────────────────────
class TestRateLimiter:
    def test_real_ip_x_forwarded_for(self):
        from core.rate_limiter import _get_real_ip
        mock_req = MagicMock()
        mock_req.headers = {"X-Forwarded-For": "1.2.3.4, 10.0.0.1"}
        mock_req.client = MagicMock(host="10.0.0.1")
        assert _get_real_ip(mock_req) == "1.2.3.4"

    def test_real_ip_fallback(self):
        from core.rate_limiter import _get_real_ip
        mock_req = MagicMock()
        mock_req.headers = {}
        mock_req.client = MagicMock(host="192.168.1.1")
        assert _get_real_ip(mock_req) == "192.168.1.1"

    def test_rate_limit_buckets(self):
        from core.rate_limiter import _get_limit
        assert _get_limit("/api/chat/message") == 20
        assert _get_limit("/api/auth/login") == 10
        assert _get_limit("/api/tasks") == 60


class TestWorkspaceGuard:
    @pytest.mark.asyncio
    async def test_workspace_member_required(self):
        from fastapi import HTTPException
        from routers.tasks_router import _require_workspace_member

        class Conn:
            async def fetchval(self, *args):
                return None

        with pytest.raises(HTTPException) as exc:
            await _require_workspace_member(Conn(), "11111111-1111-1111-1111-111111111111", "user-1")
        assert exc.value.status_code == 403


# ─── Security ────────────────────────────────────────────────────────────────
class TestSecurity:
    @pytest.mark.asyncio
    async def test_no_token_raises_401(self):
        from core.security import get_current_user
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc:
            await get_current_user(token=None)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_firebase_import_error_raises_500(self):
        """If Firebase Admin not importable, must return 500 not accept token."""
        from core.security import get_current_user
        from fastapi import HTTPException
        import builtins
        real_import = builtins.__import__

        def mock_import(name, *args, **kwargs):
            if name == "firebase_admin":
                raise ImportError("Firebase not available")
            return real_import(name, *args, **kwargs)

        with patch("builtins.__import__", side_effect=mock_import):
            with pytest.raises(HTTPException) as exc:
                await get_current_user(token="fake.jwt.token")
            assert exc.value.status_code == 500

