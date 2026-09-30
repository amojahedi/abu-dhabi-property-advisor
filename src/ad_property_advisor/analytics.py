"""Deterministic investment-analytics finance functions.

All monetary values are in AED. Every figure produced here is ILLUSTRATIVE and
based on SYNTHETIC data. This is a personal, unaffiliated portfolio project — NOT
affiliated with or endorsed by Aldar Properties — and NOTHING here is investment advice.

Default assumptions (documented, configurable):
  - Management/maintenance cost: 8% of gross annual rent.
  - Mortgage LTV: 60% (i.e. 40% cash down payment).
  - Mortgage interest rate: 5.0% annual (interest-only proxy for cash-on-cash).
"""

from __future__ import annotations

from statistics import mean

from .models import Community, CommunityAnalytics, Unit, UnitAnalytics

# ---- documented default assumptions -------------------------------------------------
DEFAULT_MGMT_MAINTENANCE_PCT = 0.08  # of gross annual rent
DEFAULT_LTV = 0.60  # loan-to-value
DEFAULT_MORTGAGE_RATE = 0.05  # annual interest rate


def price_per_sqft(unit: Unit) -> float:
    """Price per square foot in AED = price / size."""
    return round(unit.price_aed / unit.size_sqft, 2)


def gross_rental_yield(unit: Unit) -> float:
    """Gross rental yield (%) = expected annual rent / price * 100."""
    return round(unit.expected_annual_rent_aed / unit.price_aed * 100, 4)


def net_operating_income(
    unit: Unit, mgmt_maintenance_pct: float = DEFAULT_MGMT_MAINTENANCE_PCT
) -> float:
    """Net operating income (AED/yr) = gross rent - service charge - mgmt/maintenance.

    Management/maintenance is charged as a percentage of gross annual rent.
    """
    mgmt = unit.expected_annual_rent_aed * mgmt_maintenance_pct
    return unit.expected_annual_rent_aed - unit.service_charge_aed_yr - mgmt


def net_rental_yield(
    unit: Unit, mgmt_maintenance_pct: float = DEFAULT_MGMT_MAINTENANCE_PCT
) -> float:
    """Net rental yield (%) = net operating income / price * 100."""
    return round(net_operating_income(unit, mgmt_maintenance_pct) / unit.price_aed * 100, 4)


def roi(unit: Unit, mgmt_maintenance_pct: float = DEFAULT_MGMT_MAINTENANCE_PCT) -> float:
    """First-year cash ROI (%) on an all-cash purchase = net income / price * 100.

    (For a leveraged view see :func:`cash_on_cash`.)
    """
    return net_rental_yield(unit, mgmt_maintenance_pct)


def cash_on_cash(
    unit: Unit,
    ltv: float = DEFAULT_LTV,
    mortgage_rate: float = DEFAULT_MORTGAGE_RATE,
    mgmt_maintenance_pct: float = DEFAULT_MGMT_MAINTENANCE_PCT,
) -> float:
    """Cash-on-cash return (%) for a leveraged purchase.

    Equity invested = price * (1 - ltv). Annual interest cost = loan * mortgage_rate
    (interest-only proxy). Cash-on-cash = (net operating income - interest) / equity * 100.
    """
    equity = unit.price_aed * (1 - ltv)
    loan = unit.price_aed * ltv
    interest = loan * mortgage_rate
    annual_cash = net_operating_income(unit, mgmt_maintenance_pct) - interest
    if equity <= 0:
        return 0.0
    return round(annual_cash / equity * 100, 4)


def payback_period(
    unit: Unit, mgmt_maintenance_pct: float = DEFAULT_MGMT_MAINTENANCE_PCT
) -> float:
    """Simple payback period (years) = price / net operating income."""
    noi = net_operating_income(unit, mgmt_maintenance_pct)
    if noi <= 0:
        return float("inf")
    return round(unit.price_aed / noi, 2)


def unit_analytics(
    unit: Unit,
    ltv: float = DEFAULT_LTV,
    mortgage_rate: float = DEFAULT_MORTGAGE_RATE,
    mgmt_maintenance_pct: float = DEFAULT_MGMT_MAINTENANCE_PCT,
) -> UnitAnalytics:
    """Bundle the per-unit finance metrics into a model."""
    return UnitAnalytics(
        unit_id=unit.id,
        price_aed=unit.price_aed,
        price_per_sqft_aed=price_per_sqft(unit),
        gross_yield_pct=gross_rental_yield(unit),
        net_yield_pct=net_rental_yield(unit, mgmt_maintenance_pct),
        roi_pct=roi(unit, mgmt_maintenance_pct),
        cash_on_cash_pct=cash_on_cash(unit, ltv, mortgage_rate, mgmt_maintenance_pct),
        payback_years=payback_period(unit, mgmt_maintenance_pct),
    )


def price_trend_5yr(community: Community) -> list[float]:
    """Synthetic, deterministic 5-year price/sqft trend for charts.

    Purely illustrative: a fixed compounding path seeded by the community's current
    price/sqft. No randomness — same input always yields the same series.
    """
    base = community.avg_price_per_sqft_aed
    # Deterministic, illustrative growth path. The starting phase is rotated by a
    # stable hash of the community id so different communities show different
    # (but reproducible) shapes — no randomness.
    rotation = sum(ord(c) for c in community.id) % 5
    growth_pattern = [0.03, 0.05, 0.04, 0.06, 0.05]
    growth_pattern = growth_pattern[rotation:] + growth_pattern[:rotation]
    # series[0] is today's base price/sqft; each subsequent point is a projected
    # forward year, compounding by that year's growth rate. This is a synthetic
    # projection for charting, NOT a forecast.
    series = [base]
    val = base
    for g in growth_pattern[:4]:
        val = val * (1 + g)
        series.append(round(val, 2))
    return series


def community_analytics(
    community: Community,
    units: list[Unit],
    mgmt_maintenance_pct: float = DEFAULT_MGMT_MAINTENANCE_PCT,
) -> CommunityAnalytics:
    """Aggregate analytics for a community across its units."""
    comm_units = [u for u in units if u.community_id == community.id]
    if comm_units:
        avg_ppsf = round(mean(price_per_sqft(u) for u in comm_units), 2)
        avg_gross = round(mean(gross_rental_yield(u) for u in comm_units), 4)
        avg_net = round(
            mean(net_rental_yield(u, mgmt_maintenance_pct) for u in comm_units), 4
        )
    else:
        avg_ppsf = community.avg_price_per_sqft_aed
        avg_gross = 0.0
        avg_net = 0.0
    return CommunityAnalytics(
        community_id=community.id,
        unit_count=len(comm_units),
        avg_price_per_sqft_aed=avg_ppsf,
        avg_gross_yield_pct=avg_gross,
        avg_net_yield_pct=avg_net,
        price_trend_5yr_aed_per_sqft=price_trend_5yr(community),
    )
