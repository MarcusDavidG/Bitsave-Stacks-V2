'use client';

import { Card } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: bigint;
  longestStreak: bigint;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-5 w-5 text-orange-500" />
        <p className="text-sm font-medium">Saving Streak</p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Current:</span>
          <span className="font-semibold">{currentStreak.toString()} deposits</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Longest:</span>
          <span className="font-semibold">{longestStreak.toString()} deposits</span>
        </div>
      </div>
    </Card>
  );
}
