'use client';

import { Card } from '@/components/ui/card';
import { formatBlockHeight } from '@/lib/formatters';
import { Clock } from 'lucide-react';

interface LockPeriodDisplayProps {
  blocks: bigint;
  unlockHeight?: bigint;
  currentHeight?: bigint;
}

export function LockPeriodDisplay({ blocks, unlockHeight, currentHeight }: LockPeriodDisplayProps) {
  const remaining = unlockHeight && currentHeight ? unlockHeight - currentHeight : 0n;
  const isUnlocked = remaining <= 0n;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Lock Period</p>
      </div>
      <p className="text-xl font-semibold">{formatBlockHeight(blocks)}</p>
      {unlockHeight && (
        <p className={`text-sm mt-2 ${isUnlocked ? 'text-green-500' : 'text-muted-foreground'}`}>
          {isUnlocked ? '✓ Unlocked' : `${formatBlockHeight(remaining)} remaining`}
        </p>
      )}
    </Card>
  );
}
