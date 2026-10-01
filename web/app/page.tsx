"use client";

import { useState } from "react";
import { AdvisorForm } from "@/components/AdvisorForm";
import { RecommendationCard } from "@/components/RecommendationCard";
import { Card, EmptyState, ErrorState, SkeletonCard } from "@/components/ui";
import { ApiError, postRecommend } from "@/lib/api";
import type { BuyerProfile, Recommendation } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";

export default function AdvisorPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string>("");
  const [lastProfile, setLastProfile] = useState<BuyerProfile | null>(null);

  async function run(profile: BuyerProfile) {
    setStatus("loading");
    setLastProfile(profile);
    setError("");
    try {
      const res = await postRecommend(profile);
      setRecs(res.recommendations);
      setStatus("done");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unexpected error while fetching recommendations.",
      );
      setStatus("error");
    }
  }

  return (
    <div className="ambient">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
            Explainable property advisor
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find the right Abu Dhabi home — with the reasoning shown.
          </h1>
          <p className="mt-3 text-sm text-fg-muted sm:text-base">
            Tell the advisor your budget, lifestyle and goals. It ranks synthetic
            listings with a transparent, deterministic score and explains every
            match. Choose <strong>Invest</strong> to lead with rental yield.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
          {/* Form */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold">Your profile</h2>
              <AdvisorForm onSubmit={run} loading={status === "loading"} />
            </Card>
          </div>

          {/* Results */}
          <section aria-label="Recommendations" className="min-w-0">
            {status === "idle" && (
              <EmptyState
                title="Your matches will appear here"
                message="Fill in the form and submit to see ranked recommendations with the reasons behind each score."
              />
            )}

            {status === "loading" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {status === "error" && (
              <ErrorState
                title="Recommendations unavailable"
                message={error}
                onRetry={lastProfile ? () => run(lastProfile) : undefined}
              />
            )}

            {status === "done" && recs.length === 0 && (
              <EmptyState
                title="No matches in that band"
                message="No available synthetic units fit these filters. Try widening your budget, bedrooms, or lifestyle tags."
              />
            )}

            {status === "done" && recs.length > 0 && (
              <>
                <p className="mb-4 text-sm text-fg-muted">
                  {recs.length} match{recs.length === 1 ? "" : "es"}, ranked by
                  fit.
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  {recs.map((rec, i) => (
                    <RecommendationCard key={rec.unit.id} rec={rec} rank={i + 1} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
