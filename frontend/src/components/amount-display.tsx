'use client';

import { Card } from '@/components/ui/card';
import { formatSTX } from '@/lib/formatters';

interface AmountDisplayProps {
  label: string;
  amount: bigint;
  className?: string;
}

export function AmountDisplay({ label, amount, className }: AmountDisplayProps) {
  return (
    <Card className={`p-4 ${className || ''}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{formatSTX(amount)} STX</p>
    </Card>
  );
}
