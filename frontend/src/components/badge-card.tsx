'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

interface BadgeCardProps {
  tokenId: bigint;
  metadata: string;
  tier: string;
}

export function BadgeCard({ tokenId, metadata, tier }: BadgeCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3">
        <Award className="h-10 w-10 text-yellow-500" />
        <div className="flex-1">
          <p className="font-semibold">{metadata}</p>
          <Badge variant="secondary" className="mt-1">{tier}</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Token #{tokenId.toString()}</p>
    </Card>
  );
}
