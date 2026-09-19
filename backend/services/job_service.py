"""Async Job Queue Engine for KisaanBuddy Backend V2.

Manages task submission, execution state (PENDING, RUNNING, COMPLETED, FAILED),
bounded retries, and result retrieval backed by Redis / shared state.
"""
from typing import Optional, Dict, Any, Callable
import uuid
import time
import logging
import asyncio

from infrastructure.redis import redis_client

log = logging.getLogger("krishiai.jobs")


class JobService:
    def __init__(self, client=redis_client):
        self.client = client
        self._handlers: Dict[str, Callable] = {}

    def register_handler(self, task_type: str, handler: Callable):
        """Registers a worker handler function for a task_type."""
        self._handlers[task_type] = handler

    def create_job(self, task_type: str, payload: Dict[str, Any]) -> str:
        """Creates and enqueues a new background job. Returns job_id."""
        job_id = f"job_{uuid.uuid4().hex[:12]}"
        now = time.time()

        job_data = {
            "job_id": job_id,
            "task_type": task_type,
            "status": "PENDING",
            "payload": payload,
            "result": None,
            "error": None,
            "created_at": now,
            "updated_at": now,
            "retries": 0,
            "max_retries": 3,
        }

        self.client.set_json(f"job:{job_id}", job_data, ex=86400 * 3)  # 3 days TTL
        log.info("Created job %s for task_type '%s'", job_id, task_type)

        # Enqueue job_id to shared Redis task queue
        if self.client.is_connected and self.client._client:
            try:
                self.client._client.rpush("queue:tasks", job_id)
            except Exception as e:
                log.error("Failed to push job_id %s to Redis queue:tasks: %s", job_id, e)
        else:
            self.client._memory_set("queue:tasks:next", job_id)

        # Trigger async worker execution loop
        from services.worker import WorkerRunner
        worker_runner = WorkerRunner(client=self.client)
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(worker_runner.run_once())
        except RuntimeError:
            try:
                asyncio.run(worker_runner.run_once())
            except Exception as e:
                log.error("Job execution error: %s", e)

        return job_id

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves current job details and status."""
        return self.client.get_json(f"job:{job_id}")

    async def _execute_job(self, job_id: str, task_type: str, payload: Dict[str, Any]):
        """Worker execution loop with retries and timeout protection."""
        job = self.get_job(job_id)
        if not job:
            return

        job["status"] = "RUNNING"
        job["updated_at"] = time.time()
        self.client.set_json(f"job:{job_id}", job, ex=86400 * 3)

        handler = self._handlers.get(task_type)
        if not handler:
            job["status"] = "FAILED"
            job["error"] = f"No worker handler registered for {task_type}"
            self.client.set_json(f"job:{job_id}", job, ex=86400 * 3)
            return

        attempt = 0
        max_retries = job.get("max_retries", 3)

        while attempt < max_retries:
            attempt += 1
            try:
                log.info("Executing job %s (attempt %d/%d)...", job_id, attempt, max_retries)
                if asyncio.iscoroutinefunction(handler):
                    result = await asyncio.wait_for(handler(payload), timeout=30.0)
                else:
                    result = await asyncio.wait_for(asyncio.to_thread(handler, payload), timeout=30.0)

                job["status"] = "COMPLETED"
                job["result"] = result
                job["error"] = None
                job["updated_at"] = time.time()
                self.client.set_json(f"job:{job_id}", job, ex=86400 * 3)
                log.info("Job %s COMPLETED successfully.", job_id)
                return
            except Exception as e:
                log.error("Error executing job %s (attempt %d): %s", job_id, attempt, e)
                job["retries"] = attempt
                job["error"] = str(e)
                if attempt < max_retries:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff (2s, 4s, 8s)

        job["status"] = "FAILED"
        job["updated_at"] = time.time()
        self.client.set_json(f"job:{job_id}", job, ex=86400 * 3)
        log.error("Job %s permanently FAILED after %d attempts.", job_id, max_retries)


job_service = JobService()
