"""Recommendation engine determinism + correctness."""

from __future__ import annotations

from ad_property_advisor import analytics
from ad_property_advisor.models import BuyerProfile, Purpose
from ad_property_advisor.recommend import recommend


def _invest_profile(**kw):
    base = dict(
        budget_min_aed=500_000,
        budget_max_aed=3_000_000,
        purpose=Purpose.INVEST,
        lifestyle_preferences=["investment"],
        top_n=10,
    )
    base.update(kw)
    return BuyerProfile(**base)


def test_budget_respected():
    p = _invest_profile(budget_min_aed=800_000, budget_max_aed=1_500_000)
    recs = recommend(p)
    assert recs
    for r in recs:
        assert 800_000 <= r.unit.price_aed <= 1_500_000


def test_only_available_units():
    recs = recommend(_invest_profile())
    assert all(r.unit.status == "available" for r in recs)


def test_reasons_non_empty():
    recs = recommend(_invest_profile())
    assert recs
    for r in recs:
        assert r.reasons
        assert all(isinstance(x, str) and x for x in r.reasons)


def test_determinism():
    p = _invest_profile()
    a = recommend(p)
    b = recommend(p)
    assert [(r.unit.id, r.score) for r in a] == [(r.unit.id, r.score) for r in b]


def test_scores_descending_and_tiebreak_by_id():
    recs = recommend(_invest_profile())
    for i in range(len(recs) - 1):
        cur, nxt = recs[i], recs[i + 1]
        assert cur.score >= nxt.score
        if cur.score == nxt.score:
            assert cur.unit.id < nxt.unit.id


def test_invest_ranks_by_yield():
    # With a broad budget and invest purpose, yield (weight 0.55) dominates and
    # budget is a flat in-band fit, so the top pick must be one of the very
    # highest-yielding eligible units (not merely "near" it).
    recs = recommend(_invest_profile(lifestyle_preferences=[]))
    assert recs
    by_net_desc = sorted(
        recs, key=lambda r: analytics.net_rental_yield(r.unit), reverse=True
    )
    top_ids_by_yield = {r.unit.id for r in by_net_desc[:3]}
    assert recs[0].unit.id in top_ids_by_yield  # top pick is a top-3 yielder
    # invest recommendations lead with the yield rationale
    assert "yield" in recs[0].reasons[0].lower()
    assert any("yield" in reason.lower() for reason in recs[0].reasons)


def test_property_type_filter():
    p = _invest_profile(property_type="villa")
    recs = recommend(p)
    assert recs
    assert all(r.unit.type == "villa" for r in recs)


def test_top_n_respected():
    recs = recommend(_invest_profile(top_n=3))
    assert len(recs) <= 3


def test_live_purpose_lifestyle_and_commute_reasons():
    p = BuyerProfile(
        budget_min_aed=500_000,
        budget_max_aed=4_000_000,
        purpose=Purpose.LIVE,
        lifestyle_preferences=["family", "quiet"],
        hub="Reem",
        max_commute_min=40,
        top_n=5,
    )
    recs = recommend(p)
    assert recs
    joined = " ".join(recs[0].reasons).lower()
    assert "matches" in joined or "budget" in joined
