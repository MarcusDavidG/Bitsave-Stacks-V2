'use client';

import { Card } from '@/components/ui/card';
import { DepositHistoryItem } from './deposit-history-item';
import type { DepositHistoryEntry } from '@/types/contracts';

interface DepositHistoryListProps {
  entries: DepositHistoryEntry[];
}

export function DepositHistoryList({ entries }: DepositHistoryListProps) {
  if (entries.length === 0) {
    return <Card className="p-6 text-center text-muted-foreground">No deposit history</Card>;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <DepositHistoryItem key={i} entry={entry} />
      ))}
    </div>
  );
}
