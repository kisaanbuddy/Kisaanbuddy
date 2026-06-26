# Database Architecture

This document describes the database schema, models, and migration paths.

---

## Schema Overview

The application utilizes **SQLAlchemy** as its database mapper. The schema supports SQLite for local development and PostgreSQL for production deployments.

```
+------------------+          +------------------+
|      users       |          |  farmer_fields   |
+------------------+          +------------------+
| id (PK)          |<---------| user_id (FK)     |
| phone_number     |          | crop_id (FK)----|
| email            |          | field_name       |     +------------------+
| role             |          | polygon_geojson  |     |      crops       |
| created_at       |          +------------------+     +------------------+
+------------------+                   |               | id (PK)          |
         |                             v               | name             |
         |                    +------------------+     | scientific_name  |
         |                    |disease_detections|     +------------------+
         |                    +------------------+              ^
         |                    | id (PK)          |              |
         |                    | field_id (FK)    |--------------|
         |                    | image_url        |
         v                    | detected_disease |
+------------------+          +------------------+
|  user_sessions   |
+------------------+
| id (PK)          |
| user_id (FK)     |
| session_token    |
| is_revoked       |
| expires_at       |
+------------------+
```

---

## Schema Migration Strategy
- **SQLite Migrator:** The [migration.py](file:///c:/Users/HP/Kisaanbuddy/backend/db/migration.py) script automatically backs up the database file to `kisaanbuddy.db.bak` and appends missing columns on application startup when running SQLite.
- **Alembic Readiness:** The tables map to standard declarative bases, allowing developers to generate Alembic migration logs when deploying to high-concurrency databases.
