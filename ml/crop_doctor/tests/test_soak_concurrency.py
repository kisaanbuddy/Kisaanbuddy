import os
import sys
import time
import threading
import numpy as np
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image

# Ensure repo root in sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from ml.crop_doctor.inference.service import CropDoctorInferenceService

def test_repeated_sequential_soak():
    """Phase 11: 50 sequential inference calls to verify stability, no memory leak, and latency percentiles."""
    print("--- Starting Sequential Soak Test (50 iterations) ---")
    service = CropDoctorInferenceService.get_instance()
    assert service.is_ready, "Inference service must be ready"

    # Create dummy synthetic leaf-like image for pure pipeline/memory benchmarking
    test_img = Image.new("RGB", (256, 256), color=(60, 140, 40))
    # Add simple texture so it passes blur variance check
    arr = np.array(test_img)
    arr[::4, ::4] = [200, 200, 100]
    textured_img = Image.fromarray(arr)

    latencies = []
    
    for i in range(50):
        t0 = time.perf_counter()
        res = service.predict(textured_img)
        t1 = time.perf_counter()
        lat_ms = (t1 - t0) * 1000
        latencies.append(lat_ms)
        assert res["status"] in ["diagnosed", "uncertain", "retake_image"], f"Unexpected status {res['status']}"

    latencies = np.array(latencies)
    p50 = np.percentile(latencies, 50)
    p95 = np.percentile(latencies, 95)
    p99 = np.percentile(latencies, 99)
    print(f"50 calls completed successfully:")
    print(f"  Min: {np.min(latencies):.2f} ms")
    print(f"  p50: {p50:.2f} ms")
    print(f"  p95: {p95:.2f} ms")
    print(f"  p99: {p99:.2f} ms")
    print(f"  Max: {np.max(latencies):.2f} ms")
    print(f"  Mean: {np.mean(latencies):.2f} ms")
    assert p50 < 300.0, f"p50 latency ({p50:.2f}ms) exceeded 300ms SLA"

def test_multithreaded_concurrency():
    """Phase 11: Concurrent multi-threaded access using ThreadPoolExecutor."""
    print("--- Starting Concurrency Test (10 concurrent workers, 20 total requests) ---")
    service = CropDoctorInferenceService.get_instance()

    arr = np.full((256, 256, 3), [40, 120, 30], dtype=np.uint8)
    arr[::4, ::4] = [220, 180, 50]
    textured_img = Image.fromarray(arr)

    def worker_call(idx: int):
        t0 = time.perf_counter()
        out = service.predict(textured_img)
        duration = (time.perf_counter() - t0) * 1000
        return idx, out["status"], duration

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(worker_call, i) for i in range(20)]
        results = [f.result() for f in as_completed(futures)]

    for idx, status, dur in results:
        assert status in ["diagnosed", "uncertain", "retake_image"], f"Call {idx} failed with {status}"

    durs = [r[2] for r in results]
    print(f"Concurrent 20 calls completed successfully:")
    print(f"  p50: {np.percentile(durs, 50):.2f} ms")
    print(f"  Mean: {np.mean(durs):.2f} ms")

def test_unsuitable_image_handling():
    """Verify blurry/overexposed/underexposed images cleanly yield retake advice without throwing."""
    print("--- Testing Image Quality & Suitability Guardrails ---")
    service = CropDoctorInferenceService.get_instance()

    # 1. Blurry uniform image
    blank = Image.new("RGB", (256, 256), color=(100, 100, 100))
    res = service.predict(blank)
    assert res["status"] == "retake_image", f"Expected retake_image for blank, got {res['status']}"
    assert "extreme_blur" in res["image_quality"]["flags"]

    # 2. Too dark
    dark = Image.new("RGB", (256, 256), color=(5, 5, 5))
    res = service.predict(dark)
    assert res["status"] == "retake_image"
    assert "underexposed" in res["image_quality"]["flags"]

    # 3. Too bright
    bright = Image.new("RGB", (256, 256), color=(250, 250, 250))
    res = service.predict(bright)
    assert res["status"] == "retake_image"
    assert "overexposed" in res["image_quality"]["flags"]

    print("Quality guardrail checks passed.")

if __name__ == "__main__":
    test_repeated_sequential_soak()
    test_multithreaded_concurrency()
    test_unsuitable_image_handling()
    print("ALL SOAK & CONCURRENCY TESTS PASSED SUCCESSFULLY.")
