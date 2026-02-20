'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LockPeriodSelector } from './lock-period-selector';
import { parseSTX } from '@/lib/formatters';
import { deposit } from '@/lib/api/deposit';
import { useTransaction } from '@/hooks/useTransaction';
import { Loader2 } from 'lucide-react';

export function DepositFormBasic() {
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(BigInt(1008));
  const { status, txId, error, execute } = useTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountMicroSTX = parseSTX(amount);
    await execute(() => deposit(amountMicroSTX, lockPeriod));
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Deposit STX</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="amount">Amount (STX)</Label>
          <Input
            id="amount"
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <LockPeriodSelector value={lockPeriod} onChange={setLockPeriod} />

        <Button type="submit" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Deposit'
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
