# Google Calendar OAuth Token Migration - Database Implementation

## Overview
This migration moves Google Calendar OAuth tokens from ephemeral `/tmp/` file-based storage to secure encrypted database storage. This ensures tokens persist across server restarts and provides audit trails.

## What Changed

### 1. Database Schema (`/server/migrations/001_create_oauth_tokens_table.sql`)
- Created `oauth_tokens` table with columns:
  - `id` (UUID, primary key)
  - `user_id` (VARCHAR, unique - links to user)
  - `provider` (VARCHAR - defaults to 'google')
  - `encrypted_token` (TEXT - Fernet-encrypted refresh token)
  - `token_type` (VARCHAR - defaults to 'refresh_token')
  - `authorized_at` (TIMESTAMP - when token was authorized)
  - `last_used_at` (TIMESTAMP - audit trail)
  - `expires_at` (TIMESTAMP - optional expiration)
  - `created_at` / `updated_at` (TIMESTAMP - metadata)
- Added indexes on `user_id` and `provider` for fast lookups

### 2. Calendar Router Updates (`/server/routers/calendar_router.py`)

#### Removed:
- `load_tokens()` - File-based token loading from `/tmp/calendar_tokens.json`
- `save_tokens(tokens)` - File-based token saving
- `/tmp/` storage dependency

#### Added:
- `async load_token(user_id, pool)` - Loads encrypted token from database, returns decrypted refresh_token
- `async save_token(user_id, refresh_token, pool)` - Encrypts and stores token in database with ON CONFLICT UPDATE
- Database connection pool (`Depends(get_db)`) injection to all endpoints

#### Modified Endpoints:
1. **POST /authorize** - Now saves tokens to database instead of `/tmp/`
2. **GET /events** - Loads tokens from database
3. **POST /sync** - Loads tokens from database

## Implementation Details

### Token Encryption
- Uses Fernet (symmetric encryption) from `cryptography` library
- Encryption key from `ENCRYPTION_KEY` environment variable
- Tokens are NEVER stored in plain text

### Database Operations
```python
# Load token
refresh_token = await load_token(user_id, pool)

# Save token
await save_token(user_id, credentials.refresh_token, pool)
```

Both functions handle:
- Connection pooling for performance
- Error logging with context
- Proper async/await patterns

## Deployment Steps

### 1. Run Migration
```bash
# Connect to Neon PostgreSQL
psql "postgresql://[user]:[password]@[host]/[database]"

# Execute migration SQL
\i /server/migrations/001_create_oauth_tokens_table.sql

# Verify table creation
\dt oauth_tokens
```

### 2. Set Environment Variables
```bash
# Required
ENCRYPTION_KEY="your-fernet-key-here"  # Generate with: from cryptography.fernet import Fernet; print(Fernet.generate_key())

# Already exists
GOOGLE_OAUTH_SECRETS_FILE="/app/secrets/oauth_secrets.json"
```

### 3. Redeploy Server
```bash
docker build -t mithra-server .
docker run -e ENCRYPTION_KEY="..." mithra-server
```

### 4. Test OAuth Flow
1. Visit frontend and click "Connect Google Calendar"
2. Complete OAuth consent
3. Verify token saved to database:
   ```sql
   SELECT user_id, provider, authorized_at FROM oauth_tokens WHERE user_id = 'your_user_id';
   ```
4. Fetch events - should work without re-authorizing

## Benefits

✅ **Persistence** - Tokens survive server restarts  
✅ **Security** - Encrypted storage, no plain text in `/tmp/`  
✅ **Audit Trail** - Track when tokens were authorized, last used  
✅ **Multi-User** - Supports multiple users with separate tokens  
✅ **Provider Agnostic** - Extensible for other OAuth providers (Slack, GitHub, etc.)  
✅ **Production Ready** - Proper error handling and database error cases  

## Backward Compatibility

⚠️ **Breaking Change**: `/tmp/` tokens are **not** migrated automatically. Users must re-authorize Google Calendar after deployment.

To preserve old tokens during migration:
```python
# Migration script
old_tokens = load_tokens_from_file()  # Read /tmp/calendar_tokens.json
for user_id, token_data in old_tokens.items():
    await save_token(user_id, token_data['encrypted_token'], pool)
```

## Troubleshooting

### "Database unavailable" error
- Ensure `Neon` connection pool is initialized in `main.py`
- Check `DATABASE_URL` environment variable

### "Failed to decrypt calendar token" error
- Verify `ENCRYPTION_KEY` is the same across server instances
- Check token wasn't corrupted in database

### OAuth authorization fails
- Verify `GOOGLE_OAUTH_SECRETS_FILE` path exists
- Check OAuth scopes match Google Cloud Console settings

## Future Enhancements

1. **Token Refresh** - Automatically refresh expired tokens
2. **Multiple Providers** - Support Slack, GitHub, Microsoft Calendar
3. **Revocation** - Allow users to disconnect services
4. **Token Rotation** - Rotate encryption keys periodically
