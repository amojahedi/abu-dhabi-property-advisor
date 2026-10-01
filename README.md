# 🏙️ Abu Dhabi Property Advisor

> **Personal portfolio project · Synthetic data only.**
> Not affiliated with, authorised by, or endorsed by Aldar Properties or any
> developer. It uses Abu Dhabi's real-estate landscape — including well-known
> destinations — purely as *inspiration*. All numbers are invented for
> demonstration. **Nothing here is investment advice.**

A tool that helps someone **find the right Abu Dhabi home or investment** and
**understand the numbers behind it** — and, importantly, it *shows its
reasoning* instead of being a black box.

---

## 🧭 What it does (in plain English)

Imagine you're looking for a place in Abu Dhabi. You tell the app a few things:

- how much you can spend,
- how many bedrooms you need,
- whether you want to **live in it** or **invest** for rental income,
- what matters to you (waterfront? family-friendly? near schools? a short commute?).

The app then looks through a catalogue of communities and homes and gives you a
**ranked shortlist**. Crucially, next to every suggestion it explains **why** it
was chosen — for example *"Within your budget", "Net rental yield 6.1%",
"Matches: waterfront, family", "20 minutes to Reem — under your limit."*

It also acts like a simple **investment calculator**: for any property it works
out things like the **rental yield** (how much annual rent you'd earn compared
to the price), the **service charges**, and the **price per square foot**, and it
shows a **5-year price trend** chart for each community.

### Why this is interesting
Most property websites just show listings. This one is built around a small,
**transparent "reasoning engine"**: the logic that ranks homes is explainable
and predictable — the same inputs always give the same, explained results. That
makes it trustworthy in a way a mystery algorithm isn't.

> ⚠️ **Reminder:** every community, price, and rent in here is **made up** for a
> portfolio demo. Do not use it to make real property decisions.

---

## 🖼️ What you'll see

| Page | What it's for |
|------|---------------|
| **Advisor** | Fill in your budget and preferences → get a ranked shortlist, each with the reasons behind its score. |
| **Communities** | Browse all 12 synthetic communities; open one to see amenities, commute times, investment analytics, and the 5-year price-trend chart. |
| **Market** | A bird's-eye view: average rental yields and price-per-sqft across communities, with a comparison chart. |

The interface has a light/dark theme, works on mobile, and keeps a visible
"synthetic data — not investment advice" note on every screen.

---

## 🏗️ How it's built (for the technically curious)

Two cleanly separated parts: a Python **backend** (the brain) and a Next.js
**frontend** (what you see).

```
.
├── src/ad_property_advisor/   # Python backend
│   ├── models.py              # typed data models (Pydantic v2)
│   ├── data.py                # loads the synthetic dataset
│   ├── recommend.py           # the explainable recommendation engine
│   ├── analytics.py           # investment maths (yields, ROI, trends)
│   └── api.py                 # FastAPI web API
├── data/                      # 12 synthetic communities, 60 synthetic units
├── tests/                     # 30 automated tests
└── web/                       # Next.js + TypeScript + Tailwind frontend
```

- **Backend — Python, FastAPI.** The recommendation engine is a *transparent,
  deterministic, weighted scoring model* (no AI black box, no randomness). Hard
  filters (budget, type, availability) are applied first; everything else is
  softly scored, and every recommendation carries human-readable reasons. The
  analytics module computes gross/net rental yield, ROI, cash-on-cash (with
  clearly documented mortgage assumptions), payback period, and price/sqft.
- **Frontend — Next.js (App Router), TypeScript, Tailwind.** A typed client
  talks to the API. If the API isn't running, the read-only pages gracefully
  **fall back to the bundled synthetic data** so the site still renders — but it
  will never invent a *recommendation* offline; it asks you to start the API.
- **Tested & deterministic.** 30 backend tests cover recommendation correctness,
  the finance formulas (hand-verified), dataset integrity, and every API
  endpoint.

### The recommendation logic, briefly
For an **investor**, rental yield dominates the ranking (any in-budget price
scores equally, so returns lead). For someone **living in it**, lifestyle fit,
commute, and space matter more, and the app rewards staying comfortably within
budget. The weighting is just a small, readable table in `recommend.py` — no
magic.

---

## 🚀 Running it yourself

You need **Python 3.10+** and **Node.js 20+**.

### 1. Start the backend (the API)
```bash
# from the project root
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
uvicorn ad_property_advisor.api:app --reload      # serves http://localhost:8000
```
Open http://localhost:8000/docs for interactive API documentation.

### 2. Start the frontend
```bash
cd web
npm install
npm run dev                                        # serves http://localhost:3000
```
Visit **http://localhost:3000**. (The frontend expects the API at
`http://localhost:8000`; change it with `NEXT_PUBLIC_API_BASE_URL` — see
`web/.env.example`.)

### Try it from the command line (no frontend needed)
```bash
python3 -m ad_property_advisor          # prints a sample recommendation run
```

### Run the tests
```bash
pip install -e ".[test]" && pytest      # 30 tests
```

---

## 🔌 API at a glance

| Endpoint | Returns |
|----------|---------|
| `GET /health` | service status |
| `GET /communities` | all communities |
| `GET /communities/{id}` | one community |
| `GET /communities/{id}/analytics` | yields, price/sqft, 5-year trend |
| `GET /units` | units (supports filters) |
| `POST /recommend` | ranked recommendations for a buyer profile |
| `GET /analytics/summary` | portfolio-wide analytics |

---

## 📋 Honest limitations

- **The data is entirely synthetic.** Communities are inspired by real places but
  the prices, rents, and trends are invented and internally consistent only for
  demonstration.
- The 5-year price trend is a fixed illustrative curve, **not a forecast**.
- The mortgage/management assumptions in the analytics are reasonable defaults,
  documented in the code — not tailored financial modelling.
- This is a **portfolio project**, built to demonstrate clean engineering and
  product thinking, not a production real-estate platform.

## 📄 License

MIT. Built by [Aisan Mojahedi](https://github.com/amojahedi).
