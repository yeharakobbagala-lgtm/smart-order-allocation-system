# SmartOrder Frontend

Next.js UI integrated with the FastAPI backend.

## Setup

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | FastAPI base URL (no trailing slash) |

Backend also needs `CORS_ORIGINS` to include your frontend origin (e.g. `http://localhost:3000`).
