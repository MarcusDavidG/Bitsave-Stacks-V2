'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function MaxDepositSetter() {
  const [maximum, setMaximum] = useState('100000');

  return (
    <Card className="p-4">
      <Label htmlFor="maximum">Maximum Deposit Per User (STX)</Label>
      <div className="flex gap-2 mt-2">
        <Input
          id="maximum"
          type="number"
          value={maximum}
          onChange={(e) => setMaximum(e.target.value)}
        />
        <Button>Set</Button>
      </div>
    </Card>
  );
}
