'use client';

import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function AdminPanel() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      <p className="text-muted-foreground">Manage contract settings</p>
    </Card>
  );
}
