'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function MinimumDepositSetter() {
  const [minimum, setMinimum] = useState('1');

  return (
    <Card className="p-4">
      <Label htmlFor="minimum">Minimum Deposit (STX)</Label>
      <div className="flex gap-2 mt-2">
        <Input
          id="minimum"
          type="number"
          value={minimum}
          onChange={(e) => setMinimum(e.target.value)}
        />
        <Button>Set</Button>
      </div>
    </Card>
  );
}
