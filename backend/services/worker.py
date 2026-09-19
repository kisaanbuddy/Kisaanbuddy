"""Independent Background Worker Process for KisaanBuddy Backend V2.

Pops tasks from the shared Redis task queue ('queue:tasks'), executes registered
job handlers independently of FastAPI HTTP threads, and updates job state in Redis.

Usage as CLI worker:
    python -m services.worker
"""
import time
import json
import logging
import asyncio
import signal
import sys
from typing import Dict, Any, Callable

from infrastructure.redis import redis_client

log = logging.getLogger("krishiai.worker")

# Registry of task type to handler function
_WORKER_HANDLERS: Dict[str, Callable] = {}


def register_task_handler(task_type: str, handler: Callable):
    """Registers a handler for a task_type."""
    _WORKER_HANDLERS[task_type] = handler


# Sample default handlers for AI / crop check and TTS
def _default_crop_analysis_handler(payload: Dict[str, Any]) -> Dict[str, Any]:
    time.sleep(0.5)  # Simulate CPU / model inference work
    crop = payload.get("crop_name", "Wheat")
    return {
        "status": "analyzed",
        "crop": crop,
        "recommendation": f"Optimal fertilizer regimen for {crop}: NPK 120:60:40 kg/ha",
        "confidence": 0.94
    }


def _default_tts_handler(payload: Dict[str, Any]) -> Dict[str, Any]:
    time.sleep(0.3)  # Simulate TTS audio generation
    text = payload.get("text", "")
    return {
        "status": "synthesized",
        "text_length": len(text),
        "audio_url": f"/api/media/audio_sample_{hash(text) & 0xffffffff}.mp3"
    }


register_task_handler("crop_analysis", _default_crop_analysis_handler)
register_task_handler("tts_synthesis", _default_tts_handler)
register_task_handler("test_task", lambda payload: {"status": "success", "processed": payload.get("input", "")})


class WorkerRunner:
    def __init__(self, client=redis_client):
        self.client = client
        self.running = True

    def stop(self):
        self.running = False

    async def run_once(self) -> bool:
        """Pops one job ID from queue:tasks and executes it. Returns True if job processed."""
        # 1. Pop job ID from queue
        job_id = None
        if self.client.is_connected and self.client._client:
            try:
                # BLPOP or LPOP
                res = self.client._client.lpop("queue:tasks")
                if res:
                    job_id = res
            except Exception as e:
                log.error("Error popping job from Redis queue: %s", e)

        if not job_id:
            # Fallback memory pop
            job_id = self.client._memory_get("queue:tasks:next")
            if job_id:
                self.client._memory_delete("queue:tasks:next")

        if not job_id:
            return False

        # 2. Retrieve job record
        job = self.client.get_json(f"job:{job_id}")
        if not job:
            log.warning("Worker popped job_id %s, but job record was not found.", job_id)
            return False

        task_type = job.get("task_type")
        payload = job.get("payload", {})
        handler = _WORKER_HANDLERS.get(task_type)

        # 3. Mark RUNNING
        job["status"] = "RUNNING"
        job["updated_at"] = time.time()
        self.client.set_json(f"job:{job_id}", job, ex=86400 * 3)

        if not handler:
            job["status"] = "FAILED"
            job["error"] = f"No worker handler registered for task_type '{task_type}'"
            job["updated_at"] = time.time()
            self.client.set_json(f"job:{job_id}", job, ex=86400 * 3)
            log.error("Job %s FAILED: No handler for '%s'", job_id, task_type)
            return True

        # 4. Execute with 30s timeout and retries
        attempt = job.get("retries", 0) + 1
        max_retries = job.get("max_retries", 3)
        job["retries"] = attempt

        try:
            log.info("Worker executing job %s (%s) attempt %d/%d...", job_id, task_type, attempt, max_retries)
            if asyncio.iscoroutinefunction(handler):
                result = await asyncio.wait_for(handler(payload), timeout=30.0)
            else:
                result = await asyncio.wait_for(asyncio.to_thread(handler, payload), timeout=30.0)

            job["status"] = "COMPLETED"
            job["result"] = result
            job["error"] = None
            job["updated_at"] = time.time()
            self.client.set_json(f"job:{job_id}", job, ex=86400 * 3)
            log.info("Job %s COMPLETED by worker.", job_id)
        except Exception as e:
            log.error("Worker exception on job %s: %s", job_id, e)
            job["error"] = str(e)
            if attempt < max_retries:
                job["status"] = "PENDING"  # Re-enqueue for retry
                job["updated_at"] = time.time()
                self.client.set_json(f"job:{job_id}", job, ex=86400 * 3)
                # Re-push to queue
                if self.client.is_connected and self.client._client:
                    self.client._client.rpush("queue:tasks", job_id)
            else:
                job["status"] = "FAILED"
                job["updated_at"] = time.time()
                self.client.set_json(f"job:{job_id}", job, ex=86400 * 3)

        return True

    async def start(self):
        log.info("Independent Worker Process started. Listening on queue:tasks...")
        while self.running:
            processed = await self.run_once()
            if not processed:
                await asyncio.sleep(0.5)


def run_worker_main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    runner = WorkerRunner()

    def _sig_handler(sig, frame):
        log.info("Worker shutdown signal received.")
        runner.stop()

    signal.signal(signal.SIGINT, _sig_handler)
    signal.signal(signal.SIGTERM, _sig_handler)

    asyncio.run(runner.start())


if __name__ == "__main__":
    run_worker_main()
