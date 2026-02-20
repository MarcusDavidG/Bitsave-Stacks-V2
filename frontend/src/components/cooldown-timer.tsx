'use client';

import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { formatBlockHeight } from '@/lib/formatters';

interface CooldownTimerProps {
  remainingBlocks: bigint;
}

export function CooldownTimer({ remainingBlocks }: CooldownTimerProps) {
  if (remainingBlocks <= 0n) return null;

  return (
    <Card className="p-4 border-orange-500">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <div>
          <p className="font-semibold">Cooldown Active</p>
          <p className="text-sm text-muted-foreground">
            {formatBlockHeight(remainingBlocks)} remaining
          </p>
        </div>
      </div>
    </Card>
  );
}
