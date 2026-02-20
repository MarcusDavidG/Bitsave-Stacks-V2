'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function EventLogViewer() {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Contract Events</h3>
      <ScrollArea className="h-64">
        <p className="text-sm text-muted-foreground">No events to display</p>
      </ScrollArea>
    </Card>
  );
}
