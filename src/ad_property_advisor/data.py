"""Deterministic loading of the synthetic dataset.

SYNTHETIC DATA / UNAFFILIATED portfolio project. Not investment advice.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from .models import Community, Unit

_DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def _load_json(name: str) -> dict:
    with open(_DATA_DIR / name, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def load_communities() -> list[Community]:
    """Return all synthetic communities, sorted deterministically by id."""
    raw = _load_json("communities.json")["communities"]
    communities = [Community(**c) for c in raw]
    return sorted(communities, key=lambda c: c.id)


@lru_cache(maxsize=1)
def load_units() -> list[Unit]:
    """Return all synthetic units, sorted deterministically by id."""
    raw = _load_json("units.json")["units"]
    units = [Unit(**u) for u in raw]
    return sorted(units, key=lambda u: u.id)


@lru_cache(maxsize=1)
def communities_by_id() -> dict[str, Community]:
    return {c.id: c for c in load_communities()}


@lru_cache(maxsize=1)
def units_by_id() -> dict[str, Unit]:
    return {u.id: u for u in load_units()}


def get_community(community_id: str) -> Community | None:
    return communities_by_id().get(community_id)


def get_unit(unit_id: str) -> Unit | None:
    return units_by_id().get(unit_id)


def units_in_community(community_id: str) -> list[Unit]:
    return [u for u in load_units() if u.community_id == community_id]
