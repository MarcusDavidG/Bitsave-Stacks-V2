'use client';

import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { formatSTX } from '@/lib/formatters';

interface PenaltyWarningProps {
  penaltyAmount: bigint;
  penaltyRate: bigint;
}

export function PenaltyWarning({ penaltyAmount, penaltyRate }: PenaltyWarningProps) {
  return (
    <Card className="p-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
        <div>
          <p className="font-semibold text-orange-700 dark:text-orange-300">Early Withdrawal Penalty</p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
            Withdrawing before unlock will incur a {penaltyRate.toString()}% penalty
          </p>
          <p className="text-sm font-semibold mt-2">
            Penalty: {formatSTX(penaltyAmount)} STX
          </p>
        </div>
      </div>
    </Card>
  );
}
