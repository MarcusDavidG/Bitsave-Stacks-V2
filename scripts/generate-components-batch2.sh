#!/bin/bash

set -e
cd /home/marcus/Bitsave-Stacks

echo "🚀 Batch 2: Components 31-60"

# Component 31: Deposit History List
cat > frontend/src/components/deposit-history-list.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { DepositHistoryItem } from './deposit-history-item';
import type { DepositHistoryEntry } from '@/types/contracts';

interface DepositHistoryListProps {
  entries: DepositHistoryEntry[];
}

export function DepositHistoryList({ entries }: DepositHistoryListProps) {
  if (entries.length === 0) {
    return <Card className="p-6 text-center text-muted-foreground">No deposit history</Card>;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <DepositHistoryItem key={i} entry={entry} />
      ))}
    </div>
  );
}
EOF
git add frontend/src/components/deposit-history-list.tsx
git commit -m "feat: add deposit history list component"
echo "✅ Commit 31/200"

# Component 32: Badge Card
cat > frontend/src/components/badge-card.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

interface BadgeCardProps {
  tokenId: bigint;
  metadata: string;
  tier: string;
}

export function BadgeCard({ tokenId, metadata, tier }: BadgeCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3">
        <Award className="h-10 w-10 text-yellow-500" />
        <div className="flex-1">
          <p className="font-semibold">{metadata}</p>
          <Badge variant="secondary" className="mt-1">{tier}</Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Token #{tokenId.toString()}</p>
    </Card>
  );
}
EOF
git add frontend/src/components/badge-card.tsx
git commit -m "feat: add badge card component"
echo "✅ Commit 32/200"

# Component 33: Badge Grid
cat > frontend/src/components/badge-grid.tsx << 'EOF'
'use client';

import { BadgeCard } from './badge-card';
import type { BadgeMetadata } from '@/types/contracts';

interface BadgeGridProps {
  badges: BadgeMetadata[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (badges.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No badges earned yet</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge) => (
        <BadgeCard
          key={badge.tokenId.toString()}
          tokenId={badge.tokenId}
          metadata={badge.metadata}
          tier="Gold"
        />
      ))}
    </div>
  );
}
EOF
git add frontend/src/components/badge-grid.tsx
git commit -m "feat: add badge grid component"
echo "✅ Commit 33/200"

# Component 34: Stats Card
cat > frontend/src/components/stats-card.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {trend && <p className="text-xs text-green-500 mt-1">{trend}</p>}
    </Card>
  );
}
EOF
git add frontend/src/components/stats-card.tsx
git commit -m "feat: add stats card component"
echo "✅ Commit 34/200"

# Component 35: Dashboard Header
cat > frontend/src/components/dashboard-header.tsx << 'EOF'
'use client';

import { useWallet } from '@/contexts/WalletContext';
import { truncateAddress } from '@/lib/formatters';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  const { address, isConnected, connect, disconnect } = useWallet();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">BitSave</h1>
        {isConnected && address ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{truncateAddress(address)}</span>
            <Button variant="outline" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={connect}>Connect Wallet</Button>
        )}
      </div>
    </header>
  );
}
EOF
git add frontend/src/components/dashboard-header.tsx
git commit -m "feat: add dashboard header component"
echo "✅ Commit 35/200"

# Component 36: Empty State
cat > frontend/src/components/empty-state.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </Card>
  );
}
EOF
git add frontend/src/components/empty-state.tsx
git commit -m "feat: add empty state component"
echo "✅ Commit 36/200"

# Component 37: Confirmation Dialog
cat > frontend/src/components/confirmation-dialog.tsx << 'EOF'
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Confirm'
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
EOF
git add frontend/src/components/confirmation-dialog.tsx
git commit -m "feat: add confirmation dialog component"
echo "✅ Commit 37/200"

# Component 38: Cooldown Timer
cat > frontend/src/components/cooldown-timer.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { formatBlockHeight } from '@/lib/formatters';

interface CooldownTimerProps {
  remainingBlocks: bigint;
}

export function CooldownTimer({ remainingBlocks }: CooldownTimerProps) {
  if (remainingBlocks <= 0n) return null;

  return (
    <Card className="p-4 border-orange-500">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <div>
          <p className="font-semibold">Cooldown Active</p>
          <p className="text-sm text-muted-foreground">
            {formatBlockHeight(remainingBlocks)} remaining
          </p>
        </div>
      </div>
    </Card>
  );
}
EOF
git add frontend/src/components/cooldown-timer.tsx
git commit -m "feat: add cooldown timer component"
echo "✅ Commit 38/200"

# Component 39: Penalty Warning
cat > frontend/src/components/penalty-warning.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { formatSTX } from '@/lib/formatters';

interface PenaltyWarningProps {
  penaltyAmount: bigint;
  penaltyRate: bigint;
}

export function PenaltyWarning({ penaltyAmount, penaltyRate }: PenaltyWarningProps) {
  return (
    <Card className="p-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
        <div>
          <p className="font-semibold text-orange-700 dark:text-orange-300">Early Withdrawal Penalty</p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
            Withdrawing before unlock will incur a {penaltyRate.toString()}% penalty
          </p>
          <p className="text-sm font-semibold mt-2">
            Penalty: {formatSTX(penaltyAmount)} STX
          </p>
        </div>
      </div>
    </Card>
  );
}
EOF
git add frontend/src/components/penalty-warning.tsx
git commit -m "feat: add penalty warning component"
echo "✅ Commit 39/200"

# Component 40: Network Indicator
cat > frontend/src/components/network-indicator.tsx << 'EOF'
'use client';

import { Badge } from '@/components/ui/badge';
import { CURRENT_NETWORK } from '@/lib/network';

export function NetworkIndicator() {
  return (
    <Badge variant={CURRENT_NETWORK === 'testnet' ? 'secondary' : 'default'}>
      {CURRENT_NETWORK.toUpperCase()}
    </Badge>
  );
}
EOF
git add frontend/src/components/network-indicator.tsx
git commit -m "feat: add network indicator component"
echo "✅ Commit 40/200"

echo "📊 Progress: 40/200 commits completed"
