"""Analytics formula correctness against hand-computed values."""

from __future__ import annotations

import math

from ad_property_advisor import analytics
from ad_property_advisor.models import Unit

# A known synthetic unit with round numbers for hand verification.
KNOWN = Unit(
    id="TEST01",
    community_id="test",
    type="apartment",
    bedrooms=2,
    size_sqft=1000,
    price_aed=1_000_000,
    expected_annual_rent_aed=70_000,
    service_charge_aed_yr=10_000,
    status="available",
)


def test_price_per_sqft():
    assert analytics.price_per_sqft(KNOWN) == 1000.0  # 1,000,000 / 1000


def test_gross_yield():
    # 70,000 / 1,000,000 = 7.0%
    assert analytics.gross_rental_yield(KNOWN) == 7.0


def test_net_operating_income():
    # 70,000 - 10,000 service - (8% * 70,000 = 5,600) = 54,400
    assert analytics.net_operating_income(KNOWN) == 54_400.0


def test_net_yield():
    # 54,400 / 1,000,000 = 5.44%
    assert analytics.net_rental_yield(KNOWN) == 5.44


def test_cash_on_cash():
    # equity = 40% * 1M = 400,000 ; loan = 600,000 ; interest = 5% * 600,000 = 30,000
    # annual cash = 54,400 - 30,000 = 24,400 ; coc = 24,400 / 400,000 = 6.1%
    assert analytics.cash_on_cash(KNOWN) == 6.1


def test_payback_period():
    # 1,000,000 / 54,400 = 18.38 years
    assert analytics.payback_period(KNOWN) == round(1_000_000 / 54_400, 2)


def test_price_trend_deterministic_and_length():
    from ad_property_advisor.data import load_communities

    c = load_communities()[0]
    s1 = analytics.price_trend_5yr(c)
    s2 = analytics.price_trend_5yr(c)
    assert s1 == s2
    assert len(s1) == 5
    assert all(x > 0 for x in s1)


def test_community_analytics_aggregate():
    from ad_property_advisor.data import get_community, load_units

    c = get_community("yas-island")
    ca = analytics.community_analytics(c, load_units())
    assert ca.unit_count > 0
    assert ca.avg_gross_yield_pct > ca.avg_net_yield_pct
    assert not math.isnan(ca.avg_price_per_sqft_aed)
