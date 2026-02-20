'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function RewardRateAdjuster() {
  const [rate, setRate] = useState('10');

  return (
    <Card className="p-4">
      <Label htmlFor="rate">Reward Rate (%)</Label>
      <div className="flex gap-2 mt-2">
        <Input
          id="rate"
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <Button>Update</Button>
      </div>
    </Card>
  );
}
