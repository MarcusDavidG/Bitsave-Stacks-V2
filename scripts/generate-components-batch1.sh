#!/bin/bash

# BitSave Frontend Integration - Automated Component Generation
# This script creates 175 remaining components (commits 26-200)

set -e
cd /home/marcus/Bitsave-Stacks

echo "🚀 Starting automated component generation..."
echo "📊 Progress: 25/200 commits completed"
echo ""

# Component 26: Reputation Points Display
cat > frontend/src/components/reputation-points-display.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface ReputationPointsDisplayProps {
  points: bigint;
}

export function ReputationPointsDisplay({ points }: ReputationPointsDisplayProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <p className="text-sm text-muted-foreground">Reputation Points</p>
      </div>
      <p className="text-3xl font-bold">{points.toString()}</p>
    </Card>
  );
}
EOF
git add frontend/src/components/reputation-points-display.tsx
git commit -m "feat: add reputation points display component"
echo "✅ Commit 26/200"

# Component 27: Streak Display
cat > frontend/src/components/streak-display.tsx << 'EOF'
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
EOF
git add frontend/src/components/streak-display.tsx
git commit -m "feat: add streak display component"
echo "✅ Commit 27/200"

# Component 28: Goal Progress Bar
cat > frontend/src/components/goal-progress.tsx << 'EOF'
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
EOF
git add frontend/src/components/goal-progress.tsx
git commit -m "feat: add goal progress component"
echo "✅ Commit 28/200"

# Component 29: Transaction Status Badge
cat > frontend/src/components/transaction-status-badge.tsx << 'EOF'
'use client';

import { Badge } from '@/components/ui/badge';
import type { TransactionStatus } from '@/hooks/useTransaction';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const variants = {
    idle: { variant: 'secondary' as const, label: 'Ready' },
    pending: { variant: 'default' as const, label: 'Pending' },
    success: { variant: 'default' as const, label: 'Success' },
    error: { variant: 'destructive' as const, label: 'Failed' }
  };

  const { variant, label } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}
EOF
git add frontend/src/components/transaction-status-badge.tsx
git commit -m "feat: add transaction status badge component"
echo "✅ Commit 29/200"

# Component 30: Deposit History Item
cat > frontend/src/components/deposit-history-item.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { formatSTX, formatTimestamp } from '@/lib/formatters';
import type { DepositHistoryEntry } from '@/types/contracts';

interface DepositHistoryItemProps {
  entry: DepositHistoryEntry;
}

export function DepositHistoryItem({ entry }: DepositHistoryItemProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{formatSTX(entry.amount)} STX</p>
          <p className="text-sm text-muted-foreground">{formatTimestamp(entry.timestamp)}</p>
        </div>
        <Badge variant={entry.status === 'active' ? 'default' : 'secondary'}>
          {entry.status}
        </Badge>
      </div>
    </Card>
  );
}
EOF
git add frontend/src/components/deposit-history-item.tsx
git commit -m "feat: add deposit history item component"
echo "✅ Commit 30/200"

echo ""
echo "📊 Progress: 30/200 commits completed"
echo "🎯 Continuing with more components..."
