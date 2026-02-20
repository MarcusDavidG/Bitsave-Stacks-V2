'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LockPeriodSelector } from './lock-period-selector';
import { parseSTX } from '@/lib/formatters';
import { depositWithGoal } from '@/lib/api/deposit';
import { useTransaction } from '@/hooks/useTransaction';
import { Loader2, Target } from 'lucide-react';

export function DepositFormWithGoal() {
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(BigInt(1008));
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const { status, txId, error, execute } = useTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountMicroSTX = parseSTX(amount);
    const goalMicroSTX = parseSTX(goalAmount);
    await execute(() => depositWithGoal(amountMicroSTX, lockPeriod, goalMicroSTX, goalDescription));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Deposit with Goal</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="amount">Amount (STX)</Label>
          <Input
            id="amount"
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <LockPeriodSelector value={lockPeriod} onChange={setLockPeriod} />

        <div>
          <Label htmlFor="goalAmount">Goal Amount (STX)</Label>
          <Input
            id="goalAmount"
            type="number"
            step="0.000001"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="goalDescription">Goal Description</Label>
          <Input
            id="goalDescription"
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
            placeholder="e.g., Save for vacation"
            maxLength={100}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Deposit with Goal'
          )}
        </Button>

        {status === 'success' && txId && (
          <p className="text-sm text-green-500">Deposit successful! TX: {txId}</p>
        )}
        {status === 'error' && error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </form>
    </Card>
  );
}
