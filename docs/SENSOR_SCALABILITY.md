# KisaanBuddy Backend V2 — Sensor Scalability & Telemetry Data Volume Analysis

---

## 1. ESP32 FIRMWARE TELEMETRY PROFILE

- **Post Interval:** `POST_INTERVAL_MS = 15000` (1 reading every 15 seconds per node).
- **Payload Size:** ~150 bytes JSON payload per HTTP POST.
- **Payload Fields:** `device_id`, `temperature`, `humidity`, `soil_temperature`, `soil_moisture`, `raw_moisture`.

---

## 2. SCALING CALCULATIONS

### 2.1 Single Node Throughput
- **Intervals per minute:** 4 readings / minute / device.
- **Intervals per hour:** 240 readings / hour / device.
- **Intervals per day:** 5,760 readings / day / device.

### 2.2 Enterprise Fleet Projections

| Fleet Scale | Ingestion Rate | Daily Readings | Raw PostgreSQL Storage / Day | Storage / Month |
| :--- | :--- | :--- | :--- | :--- |
| **10 Nodes (Pilot)** | 0.67 req/sec | 57,600 readings | ~5.76 MB / day | ~172 MB / month |
| **100 Nodes (Regional)** | 6.67 req/sec | 576,000 readings | ~57.6 MB / day | ~1.72 GB / month |
| **1,000 Nodes (Statewide)** | 66.7 req/sec | 5,760,000 readings | ~576 MB / day | ~17.28 GB / month |
| **10,000 Nodes (National)** | 667 req/sec | 57,600,000 readings | ~5.76 GB / day | ~172.8 GB / month |

---

## 3. BOTTLENECK MITIGATION & STORAGE STRATEGY

1. **Dual-Tier State Separation:**
   - **Hot Telemetry (Redis):** Latest reading per device (`sensor:latest:{device_id}`) stored with 7-day TTL for instant real-time UI dashboard queries. Zero DB load for dashboard slider auto-fills.
   - **Cold History (PostgreSQL):** Persisted to indexed table `sensor_readings_history`.

2. **Deduplication Engine:**
   - Backend checks `device_id` and timestamp delta (`< 5.0 seconds`). Identical sensor values posted within 5 seconds are skipped to avoid duplicate DB insertions during ESP32 network retries.

3. **Retention & Aggregation Plan (Phase 3 Enterprise):**
   - Retain raw 15-second telemetry for 30 days.
   - Aggregate historical data older than 30 days into 1-hour average rollups (`hourly_sensor_aggregates`), reducing storage footprint by ~95%.
