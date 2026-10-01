# Abu Dhabi Property Advisor — Web

A polished Next.js (App Router) + TypeScript + Tailwind frontend for the Abu Dhabi
Property Advisor. It drives the FastAPI recommendation + analytics engine that lives
in the parent repository.

> **Disclaimer — read this.** Synthetic data only. This is a personal,
> **unaffiliated** portfolio project. It is **not affiliated with or endorsed by
> Aldar Properties**, and nothing here is investment advice. All figures are
> invented and illustrative. A persistent version of this notice appears in the
> app footer.

## Features

- **Advisor** (`/`) — a buyer-profile form (budget, bedrooms, purpose, property
  type, lifestyle tags, family size, commute hub + cap) that POSTs to `/recommend`
  and renders ranked recommendation cards with the human-readable reasons behind
  each score. For `invest`, the yield reason leads. Full idle/loading/empty/error
  states.
- **Communities** (`/communities`, `/communities/[id]`) — a responsive grid plus a
  detail page with amenities, commute times, an investment-analytics panel
  (gross/net yield, price/sqft, service charge) and a 5-year price-trend chart.
- **Market** (`/market`) — the `/analytics/summary` portfolio view: KPI tiles, a
  switchable per-community comparison chart, and a sortable summary table.

Dark/light theming (persisted, no flash), keyboard-accessible controls, a skip
link, and visible focus rings throughout.

## Requirements

- Node 20+ (developed on Node 25) and npm.
- The Python API from the parent repo (optional — see offline fallback below).

## Run it

**1. Start the API** (from the repository root):

```bash
# in the repo root (parent of web/)
uvicorn ad_property_advisor.api:app --reload --port 8000
```

**2. Start the frontend** (from this `web/` folder):

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

| Variable                   | Default                 | Purpose                        |
| -------------------------- | ----------------------- | ------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Base URL of the FastAPI backend |

Copy `.env.example` to `.env.local` to override.

## Offline fallback

A static deploy (or any reviewer without the Python API running) still renders:

- The **read-only** Communities and Market views fall back to the bundled synthetic
  data in `data/communities.json` / `data/units.json` (copied from the backend).
  When the API is unreachable, per-community/portfolio analytics and the price
  trend are computed client-side using the **same documented formulas** as the
  backend (`lib/analytics.ts`). An "Offline mode" notice is shown. The scoring
  engine is **never** reimplemented in TypeScript.
- The live **`/recommend`** call has no offline substitute. When the API is
  unreachable it surfaces a clear, actionable message prompting you to start the
  Python API.

## Scripts

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build (type-check + lint-safe)
npm run start   # serve the production build
npm run lint    # ESLint
npm run test    # node --test unit tests (formatters + analytics port)
```

## Project layout

```
web/
├─ app/                  # App Router pages
│  ├─ page.tsx           # Advisor (/)
│  ├─ communities/       # list + [id] detail
│  └─ market/            # portfolio analytics
├─ components/           # UI, charts, forms, cards
├─ lib/                  # api client, types, analytics port, formatters, hook
├─ data/                 # bundled synthetic JSON (offline fallback)
└─ public/
```
