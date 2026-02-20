'use client';

import { Card } from '@/components/ui/card';
import { formatSTX, formatTimestamp } from '@/lib/formatters';
import type { DepositHistoryEntry } from '@/types/contracts';

interface DepositHistoryItemProps {
  entry: DepositHistoryEntry;
}

export function DepositHistoryItem({ entry }: DepositHistoryItemProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{formatSTX(entry.amount)} STX</p>
          <p className="text-sm text-muted-foreground">{formatTimestamp(entry.timestamp)}</p>
        </div>
        <Badge variant={entry.status === 'active' ? 'default' : 'secondary'}>
          {entry.status}
        </Badge>
      </div>
    </Card>
  );
}
