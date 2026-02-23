import asyncio
import logging
from core.config import supabase

logger = logging.getLogger("mithra.warmup")


async def keep_alive():
    """Background worker that pings Supabase to prevent cold starts.
    Designed to run inside FastAPI's lifespan context."""
    logger.info("Warmup Worker: Active")

    # Wait for initial server startup
    await asyncio.sleep(5)

    while True:
        try:
            if supabase:
                supabase.table("profiles").select("id").limit(1).execute()
                logger.info("Warmup: Database ping OK")
            else:
                logger.debug("Warmup: Supabase not initialized, skipping ping")
        except Exception as e:
            logger.error(f"Warmup: ping failed: {e}")

        # Wait 9 minutes (Render free tier sleeps after 15 min)
        await asyncio.sleep(540)
