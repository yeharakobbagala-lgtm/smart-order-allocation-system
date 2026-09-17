# SmartOrder Frontend

Next.js UI integrated with the FastAPI backend.

## Setup

```bash
cd frontend
cp .env.example .env.local
# Local: NEXT_PUBLIC_API_URL=http://localhost:8000
# Or use the Railway URL from .env.example
npm install
npm run dev
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | FastAPI base URL (no trailing slash) |

### Production (Vercel)

`NEXT_PUBLIC_*` values are inlined at **build** time. Set in Vercel:

- Name: `NEXT_PUBLIC_API_URL`
- Value: `https://smart-order-allocation-system-production.up.railway.app`
- Environment: Production (and Preview if needed)

Then **redeploy**. `frontend/vercel.json` also sets this public URL for builds.

Railway `CORS_ORIGINS` must include the exact browser origin (no trailing slash), e.g. your `*.vercel.app` URL, plus local `http://localhost:3000` if needed. Do not use `*`.
