"use client";

import { CommunityCard } from "@/components/CommunityCard";
import {
  EmptyState,
  ErrorState,
  FallbackNotice,
  SectionHeading,
  SkeletonCard,
} from "@/components/ui";
import { getCommunities } from "@/lib/api";
import { useAsyncData } from "@/lib/useAsyncData";

export default function CommunitiesPage() {
  const { status, data, reload } = useAsyncData(() => getCommunities(), []);
  const communities = data?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SectionHeading
        eyebrow="Explore"
        title="Communities"
        description="Synthetic Abu Dhabi destinations with indicative pricing, lifestyle tags and commute profiles. Open any community for amenities, analytics and a 5-year price trend."
      />

      <div className="mt-8 space-y-4">
        {status === "done" && data?.source === "fallback" && <FallbackNotice />}

        {status === "loading" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {status === "error" && (
          <ErrorState message="Could not load communities." onRetry={reload} />
        )}

        {status === "done" && communities.length === 0 && (
          <EmptyState
            title="No communities"
            message="The dataset returned no communities."
          />
        )}

        {status === "done" && communities.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
