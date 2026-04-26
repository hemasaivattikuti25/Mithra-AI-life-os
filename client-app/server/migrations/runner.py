import os
import glob
from core.logging import get_logger

logger = get_logger("mithra.migrations")

async def run_migrations(pool):
    """Idempotent migration runner executed on app startup."""
    async with pool.acquire() as conn:
        # Ensure schema migrations table exists
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """)
        
        # Get applied migrations
        applied = [row['version'] for row in await conn.fetch("SELECT version FROM schema_migrations")]
        
        # Find all .sql files
        migration_dir = os.path.dirname(__file__)
        sql_files = sorted(glob.glob(os.path.join(migration_dir, "*.sql")))
        
        for file_path in sql_files:
            filename = os.path.basename(file_path)
            if filename not in applied:
                logger.info(f"Applying migration: {filename}")
                with open(file_path, "r") as f:
                    sql = f.read()
                
                async with conn.transaction():
                    await conn.execute(sql)
                    await conn.execute("INSERT INTO schema_migrations (version) VALUES ($1)", filename)
                    
        logger.info("Database schema is up to date.")
