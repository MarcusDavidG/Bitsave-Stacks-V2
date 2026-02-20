'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function CompoundFrequencySetter() {
  const [frequency, setFrequency] = useState('12');

  return (
    <Card className="p-4">
      <Label htmlFor="frequency">Compound Frequency (per year)</Label>
      <div className="flex gap-2 mt-2">
        <Input
          id="frequency"
          type="number"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        />
        <Button>Set</Button>
      </div>
    </Card>
  );
}
