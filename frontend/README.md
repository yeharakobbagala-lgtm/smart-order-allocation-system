# SmartOrder Frontend

Next.js UI/UX prototype for the **Smart Order Allocation System**.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
- Lucide icons

## Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@demo.com` | `password123` |
| Admin | `admin@demo.com` | `password123` |

## Prototype flows

**Customer:** Register → Login → Products → Details → Cart → Checkout → Allocation → 10-min reservation → Place order → Confirmation → Track / cancel

**Admin:** Login → Dashboard → Orders (allocation scores) → Products → Branches → Stock → Users

This is a frontend prototype with in-memory mock data. It is not wired to the FastAPI backend yet.

## Deploy on Vercel (monorepo)

This repo has `frontend/` and `backend/`. Vercel must use **`frontend` as the Root Directory**, or you get a 404.

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your project
2. **Settings → General → Root Directory** → set to `frontend` → Save
3. Confirm **Framework Preset** is **Next.js**
4. **Deployments → … on latest → Redeploy** (or push a new commit)

If you create a new project: Import the GitHub repo → under Root Directory click Edit → choose `frontend`.
