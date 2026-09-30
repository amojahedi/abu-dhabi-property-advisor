"""FastAPI application exposing the recommendation + analytics engine.

SYNTHETIC DATA / UNAFFILIATED portfolio project. Not investment advice.
"""

from __future__ import annotations

from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import DISCLAIMER, analytics
from .data import (
    get_community,
    load_communities,
    load_units,
    units_in_community,
)
from .models import (
    BuyerProfile,
    Community,
    CommunityAnalytics,
    Recommendation,
    Unit,
)
from .recommend import recommend

app = FastAPI(
    title="Abu Dhabi Property Advisor",
    version="0.1.0",
    description=(
        "Synthetic Abu Dhabi property recommendation + investment-analytics engine. "
        + DISCLAIMER
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- response envelopes -------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str
    disclaimer: str


class CommunitiesResponse(BaseModel):
    disclaimer: str
    communities: list[Community]


class UnitsResponse(BaseModel):
    disclaimer: str
    count: int
    units: list[Unit]


class RecommendResponse(BaseModel):
    disclaimer: str
    count: int
    recommendations: list[Recommendation]


class AnalyticsSummaryResponse(BaseModel):
    disclaimer: str
    community_count: int
    unit_count: int
    portfolio_avg_price_per_sqft_aed: float
    portfolio_avg_gross_yield_pct: float
    portfolio_avg_net_yield_pct: float
    communities: list[CommunityAnalytics]


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", disclaimer=DISCLAIMER)


@app.get("/communities", response_model=CommunitiesResponse)
def list_communities() -> CommunitiesResponse:
    return CommunitiesResponse(disclaimer=DISCLAIMER, communities=load_communities())


@app.get("/communities/{community_id}", response_model=Community)
def read_community(community_id: str) -> Community:
    community = get_community(community_id)
    if community is None:
        raise HTTPException(status_code=404, detail="Community not found")
    return community


@app.get("/communities/{community_id}/analytics", response_model=CommunityAnalytics)
def read_community_analytics(community_id: str) -> CommunityAnalytics:
    community = get_community(community_id)
    if community is None:
        raise HTTPException(status_code=404, detail="Community not found")
    return analytics.community_analytics(community, load_units())


@app.get("/units", response_model=UnitsResponse)
def list_units(
    community_id: Optional[str] = None,
    type: Optional[str] = None,
    bedrooms: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = None,
) -> UnitsResponse:
    units = load_units()
    if community_id is not None:
        units = [u for u in units if u.community_id == community_id]
    if type is not None:
        units = [u for u in units if u.type == type]
    if bedrooms is not None:
        units = [u for u in units if u.bedrooms == bedrooms]
    if min_price is not None:
        units = [u for u in units if u.price_aed >= min_price]
    if max_price is not None:
        units = [u for u in units if u.price_aed <= max_price]
    if status is not None:
        units = [u for u in units if u.status == status]
    return UnitsResponse(disclaimer=DISCLAIMER, count=len(units), units=units)


@app.post("/recommend", response_model=RecommendResponse)
def post_recommend(profile: BuyerProfile) -> RecommendResponse:
    recs = recommend(profile)
    return RecommendResponse(disclaimer=DISCLAIMER, count=len(recs), recommendations=recs)


@app.get("/analytics/summary", response_model=AnalyticsSummaryResponse)
def analytics_summary() -> AnalyticsSummaryResponse:
    communities = load_communities()
    units = load_units()
    per_community = [analytics.community_analytics(c, units) for c in communities]

    ppsf = [analytics.price_per_sqft(u) for u in units]
    gross = [analytics.gross_rental_yield(u) for u in units]
    net = [analytics.net_rental_yield(u) for u in units]
    n = len(units) or 1

    return AnalyticsSummaryResponse(
        disclaimer=DISCLAIMER,
        community_count=len(communities),
        unit_count=len(units),
        portfolio_avg_price_per_sqft_aed=round(sum(ppsf) / n, 2),
        portfolio_avg_gross_yield_pct=round(sum(gross) / n, 4),
        portfolio_avg_net_yield_pct=round(sum(net) / n, 4),
        communities=per_community,
    )
