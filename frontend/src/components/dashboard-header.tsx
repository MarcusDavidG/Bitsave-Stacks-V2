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
