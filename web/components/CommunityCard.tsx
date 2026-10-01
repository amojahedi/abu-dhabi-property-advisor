import Link from "next/link";
import type { Community } from "@/lib/types";
import { formatAed, humanizeTag } from "@/lib/format";
import { Badge, Card } from "./ui";

export function CommunityCard({ community }: { community: Community }) {
  return (
    <Link
      href={`/communities/${community.id}`}
      className="group block focus:outline-none"
    >
      <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-accent group-focus-visible:border-accent">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold group-hover:text-accent">
              {community.name}
            </h3>
            <p className="text-xs text-fg-muted">{community.zone}</p>
          </div>
          <span
            aria-hidden
            className="text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
          >
            →
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-fg-muted">
          {community.description}
        </p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-xl font-bold">
            {formatAed(community.avg_price_per_sqft_aed)}
          </span>
          <span className="text-xs text-fg-muted">/ sqft avg</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {community.lifestyle_tags.slice(0, 4).map((tag) => (
            <Badge key={tag} tone="accent">
              {humanizeTag(tag)}
            </Badge>
          ))}
        </div>
      </Card>
    </Link>
  );
}
