'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function CooldownSetter() {
  const [cooldown, setCooldown] = useState('144');

  return (
    <Card className="p-4">
      <Label htmlFor="cooldown">Withdrawal Cooldown (blocks)</Label>
      <div className="flex gap-2 mt-2">
        <Input
          id="cooldown"
          type="number"
          value={cooldown}
          onChange={(e) => setCooldown(e.target.value)}
        />
        <Button>Update</Button>
      </div>
    </Card>
  );
}
