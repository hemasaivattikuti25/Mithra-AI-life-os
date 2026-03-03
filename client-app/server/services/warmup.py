import asyncio
import logging
import os
import urllib.request

from core.config import get_db

logger = logging.getLogger("mithra.warmup")

# The public URL of this Render service — used for self-ping to prevent spin-down
SELF_URL = os.getenv("RENDER_EXTERNAL_URL", "").rstrip("/")


async def keep_alive():
    """Background worker that:
    1. Self-pings the Render /health endpoint to prevent the process from spinning down.
    2. Pings Neon DB to keep the connection pool warm.
    Runs every 9 minutes (Render free tier sleeps after 15 min of inactivity).
    """
    logger.info("Warmup Worker: Active")

    # Wait for initial server startup before starting pings
    await asyncio.sleep(10)

    while True:
        # 1. Self-ping Render HTTP process (prevents spin-down)
        if SELF_URL:
            try:
                urllib.request.urlopen(f"{SELF_URL}/ping", timeout=10)
                logger.info("Warmup: Self-ping OK")
            except Exception as e:
                logger.warning(f"Warmup: Self-ping failed (non-fatal): {e}")
        else:
            logger.debug("Warmup: RENDER_EXTERNAL_URL not set, skipping self-ping")

        # 2. Neon DB ping (keeps connection pool warm)
        try:
            pool = get_db()
            if pool:
                async with pool.acquire() as conn:
                    await conn.fetchval("SELECT 1")
                logger.info("Warmup: Database ping OK")
        except Exception as e:
            logger.error(f"Warmup: DB ping failed: {e}")

        # Wait 9 minutes before next round
        await asyncio.sleep(540)

