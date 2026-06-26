# Deployment Guide

This document outlines the hosting environment and steps required to build and deploy KisaanBuddy to production.

---

## Production Environments

KisaanBuddy is designed to deploy across two cloud platforms:
1. **Backend:** Deployed on **Render.com** as a Python Web Service.
2. **Frontend:** Deployed on **Vercel** as a Next.js App.

---

## Environment Variables Configuration

The following environment variables must be set in the production environment:

### Backend (Render Environment)
- `DATABASE_URL`: Production SQL connection string (e.g. `postgresql://user:pass@host:5432/dbname`).
- `REDIS_URL`: Shared cache connection string (e.g. `redis://:password@host:port/0`).
- `OPENAI_API_KEY`: Required for LLM prompts, vision analysis, and voice transcription.
- `OPENWEATHERMAP_API_KEY`: Key for the primary weather provider.
- `DATA_GOV_API_KEY`: Mandatory key for fetching live APMC Mandi commodity rates.
- `JWT_SECRET`: A secure cryptographically random string override.

### Frontend (Vercel Environment)
- `NEXT_PUBLIC_API_URL`: The absolute URL of the deployed FastAPI backend.

---

## Scale Out & High Availability
- **Stateless Instances:** Since session data, rate limiting, and cache states reside in PostgreSQL and Redis, you can scale the backend horizontally by running multiple Render web service containers behind a load balancer.
- **Static Assets:** Next.js pages and media elements are optimized and cached on the Vercel Edge Network.
