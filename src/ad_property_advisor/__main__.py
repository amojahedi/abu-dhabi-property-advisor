"""Demo CLI: `python -m ad_property_advisor`.

Prints a sample recommendation run + a headline analytics figure.

SYNTHETIC DATA / UNAFFILIATED portfolio project. Not investment advice.
"""

from __future__ import annotations

from . import DISCLAIMER, analytics
from .data import get_community, load_units
from .models import BuyerProfile, Purpose
from .recommend import recommend


def main() -> None:
    print("=" * 72)
    print("Abu Dhabi Property Advisor — demo")
    print(DISCLAIMER)
    print("=" * 72)

    profile = BuyerProfile(
        budget_min_aed=800_000,
        budget_max_aed=2_500_000,
        purpose=Purpose.INVEST,
        lifestyle_preferences=["investment", "waterfront"],
        hub="Reem",
        max_commute_min=30,
        top_n=3,
    )
    print("\nBuyer profile: INVEST, budget AED 0.8M–2.5M, likes investment+waterfront,")
    print("               <=30 min to Reem.\n")

    recs = recommend(profile)
    for i, r in enumerate(recs, 1):
        print(f"{i}. {r.unit.id}  {r.community.name}  ({r.unit.type}, "
              f"{r.unit.bedrooms}BR, {r.unit.size_sqft:,.0f} sqft)")
        print(f"   price AED {r.unit.price_aed:,.0f}   score {r.score}")
        for reason in r.reasons:
            print(f"     - {reason}")
        print()

    # one headline analytics figure
    if recs:
        u = recs[0].unit
        print("Sample analytics for top pick", u.id, ":")
        print(f"   net yield  {analytics.net_rental_yield(u):.2f}%")
        print(f"   cash-on-cash {analytics.cash_on_cash(u):.2f}% "
              f"(LTV {analytics.DEFAULT_LTV:.0%}, rate {analytics.DEFAULT_MORTGAGE_RATE:.1%})")
        comm = get_community(u.community_id)
        if comm:
            ca = analytics.community_analytics(comm, load_units())
            print(f"   {comm.name} avg net yield {ca.avg_net_yield_pct:.2f}% "
                  f"across {ca.unit_count} units")


if __name__ == "__main__":
    main()
