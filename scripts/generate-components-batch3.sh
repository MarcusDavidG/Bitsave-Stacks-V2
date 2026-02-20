#!/bin/bash

set -e
cd /home/marcus/Bitsave-Stacks

echo "🚀 Batch 3: Components 41-80"

# Components 41-50: Admin Features
for i in {41..50}; do
  case $i in
    41)
      cat > frontend/src/components/admin/admin-panel.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function AdminPanel() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      <p className="text-muted-foreground">Manage contract settings</p>
    </Card>
  );
}
EOF
      git add frontend/src/components/admin/admin-panel.tsx
      git commit -m "feat: add admin panel component"
      ;;
    42)
      cat > frontend/src/components/admin/reward-rate-adjuster.tsx << 'EOF'
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
EOF
      git add frontend/src/components/admin/reward-rate-adjuster.tsx
      git commit -m "feat: add reward rate adjuster component"
      ;;
    43)
      cat > frontend/src/components/admin/contract-pause-toggle.tsx << 'EOF'
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
EOF
      git add frontend/src/components/admin/contract-pause-toggle.tsx
      git commit -m "feat: add contract pause toggle component"
      ;;
    44)
      cat > frontend/src/components/admin/minimum-deposit-setter.tsx << 'EOF'
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
EOF
      git add frontend/src/components/admin/minimum-deposit-setter.tsx
      git commit -m "feat: add minimum deposit setter component"
      ;;
    45)
      cat > frontend/src/components/admin/penalty-rate-setter.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function PenaltyRateSetter() {
  const [penalty, setPenalty] = useState('20');

  return (
    <Card className="p-4">
      <Label htmlFor="penalty">Early Withdrawal Penalty (%)</Label>
      <div className="flex gap-2 mt-2">
        <Input
          id="penalty"
          type="number"
          value={penalty}
          onChange={(e) => setPenalty(e.target.value)}
        />
        <Button>Update</Button>
      </div>
    </Card>
  );
}
EOF
      git add frontend/src/components/admin/penalty-rate-setter.tsx
      git commit -m "feat: add penalty rate setter component"
      ;;
    46)
      cat > frontend/src/components/admin/event-log-viewer.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function EventLogViewer() {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Contract Events</h3>
      <ScrollArea className="h-64">
        <p className="text-sm text-muted-foreground">No events to display</p>
      </ScrollArea>
    </Card>
  );
}
EOF
      git add frontend/src/components/admin/event-log-viewer.tsx
      git commit -m "feat: add event log viewer component"
      ;;
    47)
      cat > frontend/src/components/admin/rate-history-viewer.tsx << 'EOF'
'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function RateHistoryViewer() {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Rate History</h3>
      <ScrollArea className="h-64">
        <p className="text-sm text-muted-foreground">No history available</p>
      </ScrollArea>
    </Card>
  );
}
EOF
      git add frontend/src/components/admin/rate-history-viewer.tsx
      git commit -m "feat: add rate history viewer component"
      ;;
    48)
      cat > frontend/src/components/admin/max-deposit-setter.tsx << 'EOF'
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
EOF
      git add frontend/src/components/admin/max-deposit-setter.tsx
      git commit -m "feat: add max deposit setter component"
      ;;
    49)
      cat > frontend/src/components/admin/cooldown-setter.tsx << 'EOF'
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
EOF
      git add frontend/src/components/admin/cooldown-setter.tsx
      git commit -m "feat: add cooldown setter component"
      ;;
    50)
      cat > frontend/src/components/admin/compound-frequency-setter.tsx << 'EOF'
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
EOF
      git add frontend/src/components/admin/compound-frequency-setter.tsx
      git commit -m "feat: add compound frequency setter component"
      ;;
  esac
  echo "✅ Commit $i/200"
done

echo "📊 Progress: 50/200 commits completed"
