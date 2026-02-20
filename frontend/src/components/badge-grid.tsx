'use client';

import { BadgeCard } from './badge-card';
import type { BadgeMetadata } from '@/types/contracts';

interface BadgeGridProps {
  badges: BadgeMetadata[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (badges.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No badges earned yet</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge) => (
        <BadgeCard
          key={badge.tokenId.toString()}
          tokenId={badge.tokenId}
          metadata={badge.metadata}
          tier="Gold"
        />
      ))}
    </div>
  );
}
