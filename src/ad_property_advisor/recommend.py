"""Transparent, deterministic recommendation engine.

Given a BuyerProfile, score every eligible synthetic unit with an explainable,
weighted model and return a ranked list of Recommendations, each carrying
human-readable reasons. No LLM, no randomness — deterministic tie-break by unit id.

SYNTHETIC DATA / UNAFFILIATED portfolio project. Not investment advice.
"""

from __future__ import annotations

from . import analytics
from .data import communities_by_id, load_units
from .models import (
    BuyerProfile,
    Community,
    Purpose,
    Recommendation,
    Unit,
)

# ---- scoring weights (sum to 1.0 per purpose) ---------------------------------------
WEIGHTS_LIVE = {
    "budget": 0.20,
    "bedrooms": 0.15,
    "lifestyle": 0.25,
    "commute": 0.20,
    "space": 0.15,
    "yield": 0.05,
}
WEIGHTS_INVEST = {
    "budget": 0.20,
    "bedrooms": 0.05,
    "lifestyle": 0.10,
    "commute": 0.05,
    "space": 0.05,
    "yield": 0.55,
}

# yield (net %) that maps to a full 1.0 score component
YIELD_TARGET_PCT = 7.0


def _budget_score(unit: Unit, profile: BuyerProfile) -> tuple[float, str | None]:
    lo, hi = profile.budget_min_aed, profile.budget_max_aed
    price = unit.price_aed
    if lo <= price <= hi:
        if profile.purpose == Purpose.INVEST:
            # Investors care about return, not leftover budget: any in-band price
            # scores equally so the yield weight (0.55) genuinely drives ranking.
            return 1.0, f"Within budget at AED {price:,.0f}"
        # For a home to live in, reward being comfortably inside the band.
        span = max(hi - lo, 1.0)
        headroom = (hi - price) / span  # 1.0 at floor, 0.0 at ceiling
        score = 0.7 + 0.3 * headroom
        return score, f"Within budget at AED {price:,.0f}"
    return 0.0, None


def _bedroom_score(unit: Unit, profile: BuyerProfile) -> tuple[float, str | None]:
    if profile.bedrooms is None:
        return 0.5, None
    diff = abs(unit.bedrooms - profile.bedrooms)
    if diff == 0:
        return 1.0, f"Exactly {unit.bedrooms} bedrooms as requested"
    if diff == 1:
        return 0.6, f"{unit.bedrooms} bedrooms (near your {profile.bedrooms})"
    return 0.2, None


def _lifestyle_score(
    community: Community, profile: BuyerProfile
) -> tuple[float, str | None]:
    prefs = set(profile.lifestyle_preferences)
    if not prefs:
        return 0.5, None
    overlap = prefs & set(community.lifestyle_tags)
    score = len(overlap) / len(prefs)
    if overlap:
        return score, "Matches: " + ", ".join(sorted(overlap))
    return 0.0, None


def _commute_score(
    community: Community, profile: BuyerProfile
) -> tuple[float, str | None]:
    if not profile.hub or profile.max_commute_min is None:
        return 0.5, None
    minutes = community.commute_minutes.get(profile.hub)
    if minutes is None:
        return 0.5, None
    cap = profile.max_commute_min
    if minutes <= cap:
        pct_under = (cap - minutes) / cap * 100 if cap else 0
        score = 0.6 + 0.4 * ((cap - minutes) / cap if cap else 0)
        return score, (
            f"{minutes} min to {profile.hub} "
            f"({pct_under:.0f}% under your {cap}-min cap)"
        )
    return 0.0, None


def _space_score(unit: Unit, profile: BuyerProfile) -> tuple[float, str | None]:
    # normalise size against a nominal 6000 sqft ceiling; family size nudges the target
    target = 900 + (profile.family_size or 2) * 400
    ratio = min(unit.size_sqft / target, 1.0)
    if unit.size_sqft >= target:
        return 1.0, f"Spacious at {unit.size_sqft:,.0f} sqft"
    return ratio, None


def _yield_score(unit: Unit) -> tuple[float, str | None]:
    net = analytics.net_rental_yield(unit)
    score = min(net / YIELD_TARGET_PCT, 1.0)
    score = max(score, 0.0)
    return score, f"Net yield {net:.1f}%"


def _property_type_ok(unit: Unit, profile: BuyerProfile) -> bool:
    return profile.property_type is None or unit.type == profile.property_type


def score_unit(
    unit: Unit, community: Community, profile: BuyerProfile
) -> tuple[float, list[str]]:
    """Return (score 0-100, reasons) for a single unit given a profile."""
    weights = WEIGHTS_INVEST if profile.purpose == Purpose.INVEST else WEIGHTS_LIVE

    components: dict[str, tuple[float, str | None]] = {
        "budget": _budget_score(unit, profile),
        "bedrooms": _bedroom_score(unit, profile),
        "lifestyle": _lifestyle_score(community, profile),
        "commute": _commute_score(community, profile),
        "space": _space_score(unit, profile),
        "yield": _yield_score(unit),
    }

    total = sum(weights[k] * components[k][0] for k in weights)
    reasons = [components[k][1] for k in weights if components[k][1]]

    # ensure investors always see the yield reason first
    if profile.purpose == Purpose.INVEST:
        gross = analytics.gross_rental_yield(unit)
        yield_reason = components["yield"][1]
        others = [r for r in reasons if r != yield_reason]
        reasons = ([yield_reason] if yield_reason else []) + [
            f"Gross yield {gross:.1f}%"
        ] + others

    return round(total * 100, 2), reasons


def recommend(profile: BuyerProfile, units: list[Unit] | None = None) -> list[Recommendation]:
    """Rank eligible units for a buyer profile.

    Hard filters: budget band and (optional) property-type preference. Everything else
    is soft-scored. Results are sorted by score desc, then by unit id (stable tie-break).
    """
    all_units = units if units is not None else load_units()
    comms = communities_by_id()

    results: list[Recommendation] = []
    for unit in all_units:
        if unit.status != "available":
            continue
        if not (profile.budget_min_aed <= unit.price_aed <= profile.budget_max_aed):
            continue
        if not _property_type_ok(unit, profile):
            continue
        community = comms.get(unit.community_id)
        if community is None:
            continue
        score, reasons = score_unit(unit, community, profile)
        results.append(
            Recommendation(unit=unit, community=community, score=score, reasons=reasons)
        )

    results.sort(key=lambda r: (-r.score, r.unit.id))
    return results[: profile.top_n]
