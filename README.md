# Abu Dhabi Property Advisor

> Personal portfolio project. **Synthetic data. Not affiliated with or endorsed by Aldar Properties** — it uses Abu Dhabi's real-estate landscape (incl. well-known Aldar destinations) purely as inspiration. All figures are illustrative and **not investment advice**.

A deterministic property **recommendation engine** + **investment-analytics** backend for Abu Dhabi communities, with a FastAPI service.

## Quickstart

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -e ".[test]"
python -m pytest -q            # run the test suite
python -m ad_property_advisor  # demo CLI: a sample recommendation run
uvicorn ad_property_advisor.api:app --reload   # run the API
```

## Package layout

```
pyproject.toml                         # package: ad_property_advisor
src/ad_property_advisor/
  __init__.py    # package + shared DISCLAIMER
  models.py      # Pydantic v2 domain models
  data.py        # deterministic synthetic-dataset loading (cached)
  recommend.py   # transparent weighted recommendation engine
  analytics.py   # investment-analytics finance functions
  api.py         # FastAPI app (CORS enabled)
  __main__.py    # demo CLI
data/communities.json / data/units.json  # synthetic dataset
tests/                                    # pytest + TestClient
```

## Recommendation engine

`recommend(BuyerProfile)` scores every available unit with an explainable weighted
model (budget fit, bedroom match, lifestyle-tag overlap, commute fit, space, and
rental yield). `purpose="invest"` weights net yield heavily; `purpose="live"` weights
lifestyle/commute/space. Every recommendation carries human-readable `reasons`.
Deterministic — sorted by score, tie-broken by unit id. No LLM, no randomness.

## Analytics

Deterministic finance functions in `analytics.py`: price/sqft, gross & net rental
yield, ROI, cash-on-cash (default LTV 60%, rate 5.0%), payback period, per-community
aggregates, and a synthetic 5-year price trend. Default assumptions are documented in
the module docstring. All monetary values in AED.

## API endpoints

`GET /health` · `GET /communities` · `GET /communities/{id}` ·
`GET /communities/{id}/analytics` · `GET /units` (query filters) ·
`POST /recommend` · `GET /analytics/summary`

All data is synthetic. Nothing here is investment advice.
