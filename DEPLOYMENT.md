# KrishiAI Deployment Guide

End-to-end runbook for hosting KrishiAI on **free tiers** with a publicly
shareable URL. Total time: ~30 minutes.

**Stack:**

| Piece | Host | URL |
|---|---|---|
| Frontend (Next.js) | Vercel | `https://krishiai.vercel.app` |
| Backend (FastAPI) | Render | `https://krishiai-api.onrender.com` |
| Keep-alive ping | UptimeRobot | pings `/health` every 5 min |

---

## 0. Prerequisites

- A GitHub account (push the project there)
- Email address (for Vercel + Render + UptimeRobot signups)
- API keys you already have:
  - `OPENWEATHERMAP_API_KEY`
  - `OPENAI_API_KEY` (or `GEMINI_API_KEY`)

No credit card is required for any step below.

---

## 1. Push code to GitHub

```bash
cd C:\Users\Aditya\Downloads\KrishiAI

# First time only — initialise git if not already done
git init
git branch -M main

# Verify .gitignore protects secrets
git status
# You should NOT see backend/.env, backend/venv/, node_modules/, etc.

git add .
git commit -m "Deploy: prod-ready config (Vercel + Render + UptimeRobot)"

# Create a new empty repo on github.com/new — name it "krishiai"
# Then connect and push:
git remote add origin https://github.com/<YOUR_USERNAME>/krishiai.git
git push -u origin main
```

If git asks for credentials, use a GitHub Personal Access Token
(github.com → Settings → Developer settings → Personal access tokens).

---

## 2. Deploy backend on Render (5 min)

1. Open https://render.com → **Sign up with GitHub**
2. Click **New +** → **Blueprint**
3. Connect your `krishiai` repository
4. Render auto-detects `render.yaml` at the project root → click **Apply**
5. Wait ~3 min for the first build (it pip-installs requirements.txt)
6. Go to the new `krishiai-api` service → **Environment** tab → add these keys:

   | Key | Value |
   |---|---|
   | `OPENWEATHERMAP_API_KEY` | (your existing key from `backend/.env`) |
   | `OPENAI_API_KEY` | (existing OpenRouter or OpenAI key) |
   | `OPENAI_BASE_URL` | `https://openrouter.ai/api/v1` (only if using OpenRouter) |
   | `OPENAI_CHAT_MODEL` | `google/gemini-2.0-flash-001` |
   | `GEMINI_API_KEY` | (your direct Google AI Studio key, starts with `AIza...`) |

7. Click **Save Changes** → Render redeploys automatically
8. Once status shows "Live", note your backend URL:
   `https://krishiai-api.onrender.com` (yours may have a random suffix)
9. Test it: open `https://krishiai-api.onrender.com/health` →
   should return `{"status":"ok","service":"krishiai"}`

**If build fails:** check the Logs tab for the error — usually a missing
package in `requirements.txt`. Push a fix and Render auto-rebuilds.

---

## 3. Deploy frontend on Vercel (5 min)

1. Open https://vercel.com → **Sign up with GitHub**
2. Click **Add New** → **Project** → import the `krishiai` repo
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend-next`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
4. Expand **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://krishiai-api.onrender.com` (your Render URL from step 2) |

5. Click **Deploy** → wait ~2 min
6. Done — you'll see your live URL: `https://krishiai-XXXX.vercel.app`

**Custom subdomain on Vercel** (optional, free):
   - Project → Settings → Domains → Add → `krishiai.vercel.app`
     (if available — Vercel reserves common names)
   - Or use any `<anything>.vercel.app`

---

## 4. Update Render's CORS to allow Vercel domain (1 min)

The default `render.yaml` already allows any `*.vercel.app`. If you
picked a custom domain (e.g. krishiai.in), update the env var:

1. Render dashboard → `krishiai-api` → Environment
2. Edit `ALLOWED_ORIGINS`:
   ```
   ["https://krishiai.vercel.app","https://krishiai.in","http://localhost:3000"]
   ```
3. Save → service redeploys

---

## 5. Set up UptimeRobot keep-alive (5 min)

Render's free tier sleeps after 15 minutes of inactivity. UptimeRobot
pings the backend every 5 minutes to keep it warm.

1. Open https://uptimerobot.com → **Sign up free**
2. Click **+ New Monitor**
3. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: KrishiAI Backend
   - **URL**: `https://krishiai-api.onrender.com/health`
   - **Monitoring Interval**: 5 minutes
4. Click **Create Monitor**
5. Done — backend will now never sleep

**Verification**: come back after 30 min, check Render logs — you'll see
`GET /health` requests every 5 minutes.

---

## 6. Test the full deployment

Open your Vercel URL in a browser. Try each portal:

- `/` — landing page loads
- `/weather` — search a city, see live weather (proves backend connection)
- `/chatbot` — open the chat widget, ask a question
- `/disease` — upload a leaf photo
- `/worker-connect` — post a job, search jobs (proves jobs.json works)
- `/crop-predictor` — submit soil values

If any portal shows "API error" or doesn't load:

1. Open browser DevTools → Console tab — look for CORS errors
2. Check Vercel **Function Logs** for frontend errors
3. Check Render **Logs** for backend errors

---

## 7. Optional: free custom domain

Default `*.vercel.app` is enough for college submission. If you want
something nicer:

| Option | Cost | Setup time |
|---|---|---|
| Stick with `krishiai.vercel.app` | Free | done |
| `krishiai.duckdns.org` | Free | 5 min — duckdns.org → claim subdomain → Vercel: add custom domain |
| `.xyz` domain (e.g. `krishi.xyz`) | ~₹100 first year | 15 min — Namecheap signup, point to Vercel |
| `.me` via GitHub Student Pack | Free with `.edu` email | education.github.com/pack |

For Vercel custom domain setup: Project → Settings → Domains → Add →
follow Vercel's DNS instructions on your registrar.

---

## 8. Subsequent updates

After this initial setup:

```bash
# Make code changes locally
git add .
git commit -m "fix: <describe change>"
git push
```

Both Vercel and Render auto-redeploy on push. Wait ~2 minutes per side,
done. No manual deploy step ever needed again.

---

## Troubleshooting

**"Backend cold-starts even with UptimeRobot"** — UptimeRobot's free tier
takes 5 min to start pinging after monitor creation. Wait 10 min after
setup, the keep-alive will kick in.

**"jobs.json data disappears"** — Render free tier has ephemeral
filesystem; on restart, jobs.json resets to `[]`. For demo this is fine
(jobs persist for hours of uptime). For permanent storage, add a paid
$1/month Render disk OR migrate to Supabase free Postgres.

**"Vercel build fails: Module not found"** — usually a missing package.
Run `npm install <package>` locally, commit `package.json` + lock,
push. Vercel rebuilds.

**"CORS blocked" in browser console** — backend's
`ALLOWED_ORIGIN_REGEX` doesn't match your frontend URL. Update the
Render env var to include your domain.

**"OpenAI API errors"** — wrong key or quota exceeded. Check Render
service logs for the actual error message. Update env var, save —
Render redeploys.
