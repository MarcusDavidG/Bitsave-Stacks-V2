'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';

export function ContractPauseToggle({ isPaused }: { isPaused: boolean }) {
  return (
    <Card className="p-4">
      <Button variant={isPaused ? 'default' : 'destructive'} className="w-full">
        {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
        {isPaused ? 'Unpause Contract' : 'Pause Contract'}
      </Button>
    </Card>
  );
}
