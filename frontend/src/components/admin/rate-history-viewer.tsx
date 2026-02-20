'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function RateHistoryViewer() {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Rate History</h3>
      <ScrollArea className="h-64">
        <p className="text-sm text-muted-foreground">No history available</p>
      </ScrollArea>
    </Card>
  );
}
