'use client';

import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface ReputationPointsDisplayProps {
  points: bigint;
}

export function ReputationPointsDisplay({ points }: ReputationPointsDisplayProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <p className="text-sm text-muted-foreground">Reputation Points</p>
      </div>
      <p className="text-3xl font-bold">{points.toString()}</p>
    </Card>
  );
}
