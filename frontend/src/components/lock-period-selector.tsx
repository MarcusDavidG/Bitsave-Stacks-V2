'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BLOCKS_PER_DAY, BLOCKS_PER_WEEK, BLOCKS_PER_MONTH, BLOCKS_PER_YEAR } from '@/lib/network';

interface LockPeriodSelectorProps {
  value: bigint;
  onChange: (value: bigint) => void;
}

const PRESETS = [
  { label: '1 Week', blocks: BLOCKS_PER_WEEK },
  { label: '1 Month', blocks: BLOCKS_PER_MONTH },
  { label: '3 Months', blocks: BLOCKS_PER_MONTH * 3 },
  { label: '6 Months', blocks: BLOCKS_PER_MONTH * 6 },
  { label: '1 Year', blocks: BLOCKS_PER_YEAR },
];

export function LockPeriodSelector({ value, onChange }: LockPeriodSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Lock Period</Label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant={value === BigInt(preset.blocks) ? 'default' : 'outline'}
            onClick={() => onChange(BigInt(preset.blocks))}
            className="w-full"
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
