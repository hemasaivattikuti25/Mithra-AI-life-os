from typing import Optional

class WorkspaceRepository:
    def __init__(self, pool):
        self.pool = pool

    async def get_by_user(self, user_id: str):
        async with self.pool.acquire() as conn:
            return await conn.fetch("""
                SELECT w.*, wm.role as user_role 
                FROM workspaces w
                JOIN workspace_members wm ON w.id = wm.workspace_id
                WHERE wm.user_id = $1
            """, user_id)

    async def create(self, name: str, user_id: str, join_code: str, share_link_hash: str):
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                ws = await conn.fetchrow("""
                    INSERT INTO workspaces (name, join_code, share_link_hash)
                    VALUES ($1, $2, $3) RETURNING *
                """, name, join_code, share_link_hash)
                
                await conn.execute("""
                    INSERT INTO workspace_members (workspace_id, user_id, role)
                    VALUES ($1, $2, 'owner')
                """, ws['id'], user_id)
                
                return ws
