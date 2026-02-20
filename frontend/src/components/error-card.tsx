'use client';

import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="p-6 border-destructive">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
        <div>
          <h3 className="font-semibold text-destructive">Error</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
      </div>
    </Card>
  );
}
