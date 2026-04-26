from typing import List, Optional
import json

class TaskRepository:
    def __init__(self, pool):
        self.pool = pool

    async def get_all_by_user(self, user_id: str, workspace_id: Optional[str] = None):
        async with self.pool.acquire() as conn:
            if workspace_id:
                return await conn.fetch("SELECT * FROM tasks WHERE workspace_id = $1 ORDER BY created_at DESC", workspace_id)
            else:
                return await conn.fetch("SELECT * FROM tasks WHERE user_id = $1 AND workspace_id IS NULL ORDER BY created_at DESC", user_id)

    async def create(self, user_id: str, data: dict):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow("""
                INSERT INTO tasks (user_id, title, completed, priority, duration, ai_suggested, workspace_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            """, user_id, data['title'], data.get('completed', False), data.get('priority', 'medium'), data.get('duration'), data.get('ai_suggested', False), data.get('workspaceId'))

    async def update(self, user_id: str, task_id: int, data: dict):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow("""
                UPDATE tasks
                SET title = COALESCE($1, title), completed = COALESCE($2, completed), priority = COALESCE($3, priority), duration = COALESCE($4, duration)
                WHERE id = $5 AND (user_id = $6 OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = $6))
                RETURNING *
            """, data.get('title'), data.get('completed'), data.get('priority'), data.get('duration'), task_id, user_id)

    async def delete(self, user_id: str, task_id: int):
        async with self.pool.acquire() as conn:
            await conn.execute("""
                DELETE FROM tasks
                WHERE id = $1 AND (user_id = $2 OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = $2))
            """, task_id, user_id)

    async def delete_completed(self, user_id: str):
        async with self.pool.acquire() as conn:
            await conn.execute("DELETE FROM tasks WHERE user_id = $1 AND completed = TRUE AND workspace_id IS NULL", user_id)
