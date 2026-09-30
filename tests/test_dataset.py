"""Dataset integrity tests."""

from __future__ import annotations

from ad_property_advisor.data import communities_by_id, load_communities, load_units


def test_ids_unique():
    comms = load_communities()
    units = load_units()
    assert len({c.id for c in comms}) == len(comms)
    assert len({u.id for u in units}) == len(units)


def test_referential_integrity():
    comm_ids = set(communities_by_id())
    for u in load_units():
        assert u.community_id in comm_ids, u.id


def test_rent_price_ratio_sane():
    for u in load_units():
        ratio = u.expected_annual_rent_aed / u.price_aed
        assert 0.045 <= ratio <= 0.085, (u.id, ratio)


def test_counts_in_expected_range():
    assert 10 <= len(load_communities()) <= 12
    assert 60 <= len(load_units()) <= 100


def test_deterministic_load_order():
    ids1 = [u.id for u in load_units()]
    ids2 = [u.id for u in load_units()]
    assert ids1 == ids2 == sorted(ids1)


def test_villas_pricier_than_apartments():
    units = load_units()
    from ad_property_advisor.analytics import price_per_sqft

    villa_ppsf = [price_per_sqft(u) for u in units if u.type == "villa"]
    apt_ppsf = [price_per_sqft(u) for u in units if u.type == "apartment"]
    assert villa_ppsf and apt_ppsf
    assert sum(villa_ppsf) / len(villa_ppsf) > sum(apt_ppsf) / len(apt_ppsf)
