"""Pydantic v2 domain models.

SYNTHETIC DATA / UNAFFILIATED portfolio project. Not investment advice.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator

LifestyleTag = Literal[
    "family",
    "waterfront",
    "golf",
    "urban",
    "investment",
    "schools-nearby",
    "beach",
    "quiet",
]

Hub = Literal["Abu Dhabi Downtown", "Corniche", "Yas Island", "Reem", "Airport"]

PropertyType = Literal["apartment", "townhouse", "villa"]


class Purpose(str, Enum):
    LIVE = "live"
    INVEST = "invest"


class Community(BaseModel):
    """A synthetic Abu Dhabi community/destination."""

    id: str
    name: str
    zone: str
    description: str
    lifestyle_tags: list[str]
    avg_price_per_sqft_aed: float = Field(gt=0)
    typical_service_charge_aed_sqft_yr: float = Field(ge=0)
    amenities: list[str]
    commute_minutes: dict[str, int]


class Unit(BaseModel):
    """A synthetic unit/listing within a community."""

    id: str
    community_id: str
    type: PropertyType
    bedrooms: int = Field(ge=0)
    size_sqft: float = Field(gt=0)
    price_aed: float = Field(gt=0)
    expected_annual_rent_aed: float = Field(ge=0)
    service_charge_aed_yr: float = Field(ge=0)
    status: str


class BuyerProfile(BaseModel):
    """Inputs that drive the recommendation engine."""

    budget_min_aed: float = Field(ge=0)
    budget_max_aed: float = Field(gt=0)
    bedrooms: int | None = Field(default=None, ge=0)
    purpose: Purpose = Purpose.LIVE
    lifestyle_preferences: list[str] = Field(default_factory=list)
    family_size: int | None = Field(default=None, ge=0)
    hub: str | None = None
    max_commute_min: int | None = Field(default=None, ge=0)
    property_type: PropertyType | None = None
    top_n: int = Field(default=5, ge=1, le=50)

    @field_validator("budget_max_aed")
    @classmethod
    def _max_ge_min(cls, v: float, info) -> float:
        lo = info.data.get("budget_min_aed")
        if lo is not None and v < lo:
            raise ValueError("budget_max_aed must be >= budget_min_aed")
        return v


class Recommendation(BaseModel):
    """A ranked recommendation with a transparent score and human-readable reasons."""

    unit: Unit
    community: Community
    score: float = Field(ge=0, le=100)
    reasons: list[str]


class CommunityAnalytics(BaseModel):
    community_id: str
    unit_count: int
    avg_price_per_sqft_aed: float
    avg_gross_yield_pct: float
    avg_net_yield_pct: float
    price_trend_5yr_aed_per_sqft: list[float]


class UnitAnalytics(BaseModel):
    unit_id: str
    price_aed: float
    price_per_sqft_aed: float
    gross_yield_pct: float
    net_yield_pct: float
    roi_pct: float
    cash_on_cash_pct: float
    payback_years: float
