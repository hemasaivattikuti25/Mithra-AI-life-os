class UserRepository:
    def __init__(self, pool):
        self.pool = pool

    async def get_profile(self, user_id: str):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow("SELECT * FROM users WHERE id = $1", user_id)

    async def upsert_profile(self, user_id: str, email: str, full_name: str):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow("""
                INSERT INTO users (id, email, full_name)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO UPDATE SET email = $2, full_name = $3
                RETURNING *
            """, user_id, email, full_name)
