'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { EXPLORER_URLS } from '@/lib/contracts';

interface SuccessCardProps {
  message: string;
  txId?: string;
}

export function SuccessCard({ message, txId }: SuccessCardProps) {
  return (
    <Card className="p-6 border-green-500">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-green-500">Success</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
          {txId && (
            <a
              href={EXPLORER_URLS.transaction(txId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              View transaction →
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
