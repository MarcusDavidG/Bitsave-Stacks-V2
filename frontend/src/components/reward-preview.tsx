'use client';

import { Card } from '@/components/ui/card';
import { formatSTX } from '@/lib/formatters';
import { calculateReward } from '@/lib/calculations';
import { TrendingUp } from 'lucide-react';

interface RewardPreviewProps {
  amount: bigint;
  lockPeriod: bigint;
  rewardRate: bigint;
}

export function RewardPreview({ amount, lockPeriod, rewardRate }: RewardPreviewProps) {
  const estimatedReward = calculateReward(amount, rewardRate, lockPeriod);
  const total = amount + estimatedReward;

  return (
    <Card className="p-4 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">Estimated Rewards</p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Deposit:</span>
          <span className="font-medium">{formatSTX(amount)} STX</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Rewards:</span>
          <span className="font-medium text-green-500">+{formatSTX(estimatedReward)} STX</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-lg">{formatSTX(total)} STX</span>
        </div>
      </div>
    </Card>
  );
}
