# Deploying

Three pieces, three platforms, and they must go in this order — each one
needs something from the one before it.

```
1. Neon     (database)  ──gives you──▶  connection strings
2. Railway  (backend)   ──needs Neon's strings──▶  gives you a URL
3. Vercel   (frontend)  ──needs Railway's URL──▶  gives you a URL
4. Go back to Railway and give IT Vercel's URL (see "Connect them" below)
```

None of this can be done from a terminal — it's account creation and
dashboard clicks on each platform's website. Steps 1–3 can each be done from
a phone browser.

## 1. Neon (database)

1. Go to [neon.tech](https://neon.tech), sign up, **New Project**.
2. Once created, the dashboard shows a connection string. You need it
   **twice**, in two different forms — click through the connection string
   panel until you can see both:
   - **Pooled connection** (hostname contains `-pooler`) → this is
     `DATABASE_URL`
   - **Direct connection** (no `-pooler`) → this is `DIRECT_URL`
3. Copy both somewhere safe for step 2. They look like:
   `postgresql://user:password@host/neondb?sslmode=require`

Reminder of why there are two (from step 2 of this project): the app makes
many short queries and wants the pooled connection; running migrations
takes a lock that a pooler can break, so migrations need the direct one.

## 2. Railway (backend)

1. Go to [railway.app](https://railway.app), sign up, **New Project** →
   **Deploy from GitHub repo** → pick this repo.
2. Click the new service → **Settings**, and set:
   | Field | Value |
   |---|---|
   | Root Directory | `server` |
   | Build Command | `npm run build` |
   | Start Command | `npm start` |
   | Pre-Deploy Command | `npm run db:deploy` |
   | Health Check Path | `/health` |

   (Pre-Deploy Command may be under a "Deploy" section. It's what runs the
   database migration from step 2 — `prisma migrate deploy` — once, before
   each new deploy starts serving traffic.)
3. Go to the **Variables** tab and add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | the **pooled** string from Neon |
   | `DIRECT_URL` | the **direct** string from Neon |
   | `JWT_SECRET` | a random secret (Claude generated one for you in chat — never commit this value to git) |
   | `CLIENT_ORIGIN` | placeholder for now, e.g. `https://placeholder.vercel.app` — fixed in step 4 |
4. Deploy. Once it's live, find the public URL — **Settings → Networking →
   Generate Domain** if one isn't already shown. It looks like
   `https://your-service.up.railway.app`. Save this for step 3.

## 3. Vercel (frontend)

1. Go to [vercel.com](https://vercel.com), sign up, **Add New → Project** →
   import this same repo.
2. Set **Root Directory** to `client`. Framework Preset should
   auto-detect as Vite.
3. Add an environment variable:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | the Railway URL from step 2.4 (no trailing slash) |
4. Deploy. Copy the resulting URL, e.g. `https://your-app.vercel.app`.

## 4. Connect them

1. Back in Railway → **Variables**, change `CLIENT_ORIGIN` to the real
   Vercel URL from step 3.4 (no trailing slash).
2. Railway redeploys automatically when a variable changes.
3. Visit the Vercel URL and try registering a real account.

If registering silently does nothing, it's almost always `CLIENT_ORIGIN` or
`VITE_API_URL` being wrong or mismatched — see step 3 of this project
(CORS) for what that setting does.

## Custom domain (optional)

Not required — the free `*.vercel.app` address works immediately. If you
already own a domain, add it under Vercel → your project → **Settings →
Domains**, then follow Vercel's on-screen instructions to point your
domain's DNS at Vercel (usually one CNAME record with your registrar).
