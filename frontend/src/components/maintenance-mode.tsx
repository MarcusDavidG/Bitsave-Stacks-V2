'use client';

import { Card } from '@/components/ui/card';

export function MaintenanceMode() {
  return (
    <Card className="p-4">
      <h3 className="font-semibold">Maintenance Mode</h3>
      <p className="text-sm text-muted-foreground mt-2">Ready for integration</p>
    </Card>
  );
}
