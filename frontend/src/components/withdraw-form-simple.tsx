'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { withdraw } from '@/lib/api/withdraw';
import { useTransaction } from '@/hooks/useTransaction';
import { useSavings } from '@/hooks/useSavings';
import { useWallet } from '@/contexts/WalletContext';
import { formatSTX, formatBlockHeight } from '@/lib/formatters';
import { Loader2, Lock, Unlock } from 'lucide-react';

export function WithdrawFormSimple() {
  const { address } = useWallet();
  const { savings, loading } = useSavings(address);
  const { status, txId, error, execute } = useTransaction();

  const handleWithdraw = async () => {
    await execute(() => withdraw());
  };

  if (loading) return <Card className="p-6">Loading...</Card>;
  if (!savings || savings.amount === 0n) {
    return <Card className="p-6">No active deposit found.</Card>;
  }

  const isLocked = savings.unlockHeight > BigInt(Date.now() / 1000);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Withdraw</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Deposited Amount:</span>
          <span className="font-semibold">{formatSTX(savings.amount)} STX</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status:</span>
          <span className={`flex items-center gap-2 ${isLocked ? 'text-orange-500' : 'text-green-500'}`}>
            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {isLocked ? 'Locked' : 'Unlocked'}
          </span>
        </div>
      </div>

      <Button
        onClick={handleWithdraw}
        className="w-full"
        disabled={status === 'pending' || isLocked}
      >
        {status === 'pending' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Withdraw'
        )}
      </Button>

      {status === 'success' && txId && (
        <p className="text-sm text-green-500 mt-4">Withdrawal successful! TX: {txId}</p>
      )}
      {status === 'error' && error && (
        <p className="text-sm text-destructive mt-4">{error}</p>
      )}
    </Card>
  );
}
