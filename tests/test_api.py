"""API endpoint tests using httpx TestClient."""

from __future__ import annotations

from fastapi.testclient import TestClient

from ad_property_advisor.api import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["disclaimer"]


def test_communities():
    r = client.get("/communities")
    assert r.status_code == 200
    body = r.json()
    assert body["communities"]
    assert "disclaimer" in body


def test_community_detail_and_404():
    cid = client.get("/communities").json()["communities"][0]["id"]
    r = client.get(f"/communities/{cid}")
    assert r.status_code == 200
    assert r.json()["id"] == cid
    assert client.get("/communities/does-not-exist").status_code == 404


def test_community_analytics():
    cid = client.get("/communities").json()["communities"][0]["id"]
    r = client.get(f"/communities/{cid}/analytics")
    assert r.status_code == 200
    body = r.json()
    assert body["community_id"] == cid
    assert len(body["price_trend_5yr_aed_per_sqft"]) == 5


def test_units_filtering():
    r = client.get("/units", params={"type": "villa", "status": "available"})
    assert r.status_code == 200
    body = r.json()
    assert body["count"] == len(body["units"])
    assert all(u["type"] == "villa" for u in body["units"])


def test_recommend_endpoint():
    payload = {
        "budget_min_aed": 800_000,
        "budget_max_aed": 2_500_000,
        "purpose": "invest",
        "lifestyle_preferences": ["investment", "waterfront"],
        "hub": "Reem",
        "max_commute_min": 30,
        "top_n": 3,
    }
    r = client.post("/recommend", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body["count"] <= 3
    assert body["recommendations"]
    top = body["recommendations"][0]
    assert 800_000 <= top["unit"]["price_aed"] <= 2_500_000
    assert top["reasons"]


def test_analytics_summary():
    r = client.get("/analytics/summary")
    assert r.status_code == 200
    body = r.json()
    assert body["unit_count"] > 0
    assert body["community_count"] > 0
    assert body["portfolio_avg_gross_yield_pct"] > body["portfolio_avg_net_yield_pct"]
