'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function PenaltyRateSetter() {
  const [penalty, setPenalty] = useState('20');

  return (
    <Card className="p-4">
      <Label htmlFor="penalty">Early Withdrawal Penalty (%)</Label>
      <div className="flex gap-2 mt-2">
        <Input
          id="penalty"
          type="number"
          value={penalty}
          onChange={(e) => setPenalty(e.target.value)}
        />
        <Button>Update</Button>
      </div>
    </Card>
  );
}
