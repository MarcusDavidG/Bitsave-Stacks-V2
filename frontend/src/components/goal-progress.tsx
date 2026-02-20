'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatSTX } from '@/lib/formatters';
import { Target } from 'lucide-react';

interface GoalProgressProps {
  current: bigint;
  goal: bigint;
  description: string;
}

export function GoalProgress({ current, goal, description }: GoalProgressProps) {
  const progress = goal > 0n ? Number((current * 100n) / goal) : 0;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-5 w-5 text-primary" />
        <p className="font-medium">{description}</p>
      </div>
      <Progress value={progress} className="mb-2" />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{formatSTX(current)} STX</span>
        <span className="font-semibold">{formatSTX(goal)} STX</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% complete</p>
    </Card>
  );
}
