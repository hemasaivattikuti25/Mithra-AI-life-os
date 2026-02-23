import asyncio
import logging
import httpx
from core.config import supabase

logger = logging.getLogger("warmup")

async def keep_alive():
    """
    Background worker that pings the database/api 
    to prevent cold starts on Supabase/Railway.
    """
    logger.info("Mithra Warmup Worker: Active")
    
    # Wait for initial server startup
    await asyncio.sleep(5)
    
    while True:
        try:
            # We perform a lightweight read on a public table 
            # or just a health check if possible.
            # Using profiles table as a baseline check.
            if supabase:
                # Lightweight query: check if profiles exists
                supabase.table("profiles").select("id").limit(1).execute()
                logger.info("Warmup: Database ping successful")
            else:
                logger.warning("Warmup: Supabase client not initialized")
                
        except Exception as e:
            logger.error(f"Warmup: Error pinging database: {str(e)}")
            
        # Wait 9 minutes (Supabase/Railway idle timeouts are usually 15-30m)
        await asyncio.sleep(540)

def start_warmup_worker():
    """Creates the background task."""
    loop = asyncio.get_event_loop()
    loop.create_task(keep_alive())
