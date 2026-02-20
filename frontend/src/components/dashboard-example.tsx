/**
 * Example Dashboard Component
 * Demonstrates complete BitSave contract integration
 */

'use client';

import { useEffect, useState } from 'react';
import { useConnect } from '@stacks/connect-react';
import { userSession } from '@/lib/stacks';
import { 
  useSavingsData, 
  useReputationData, 
  useDeposit, 
  useWithdraw 
} from '@/hooks/useBitsaveContract';
import { microStxToStx, blocksToDays } from '@/lib/bitsave-integration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DashboardExample() {
  const { doOpenAuth } = useConnect();
  const [userAddress, setUserAddress] = useState<string>();
  const [depositAmount, setDepositAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('');

  // Read data hooks
  const { data: savings, loading: savingsLoading, refetch: refetchSavings } = useSavingsData(userAddress);
  const { data: reputation, loading: reputationLoading } = useReputationData(userAddress);

  // Write hooks
  const { execute: executeDeposit, loading: depositLoading, txId: depositTxId } = useDeposit();
  const { execute: executeWithdraw, loading: withdrawLoading, txId: withdrawTxId } = useWithdraw();

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUserAddress(userData.profile.stxAddress.testnet);
    }
  }, []);

  const handleConnect = () => {
    doOpenAuth();
  };

  const handleDeposit = async () => {
    try {
      const amountMicroStx = parseFloat(depositAmount) * 1000000;
      const lockBlocks = parseInt(lockPeriod);
      
      await executeDeposit(amountMicroStx, lockBlocks);
      
      // Refetch data after successful deposit
      setTimeout(() => refetchSavings(), 3000);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await executeWithdraw();
      
      // Refetch data after successful withdrawal
      setTimeout(() => refetchSavings(), 3000);
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  if (!userAddress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnect} className="w-full">
              Connect Stacks Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">BitSave Dashboard</h1>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Address: {userAddress}</p>
        </CardContent>
      </Card>

      {/* Savings Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Savings</CardTitle>
        </CardHeader>
        <CardContent>
          {savingsLoading ? (
            <p>Loading...</p>
          ) : savings?.value ? (
            <div className="space-y-2">
              <p>Amount: {microStxToStx(savings.value.amount?.value || 0)} STX</p>
              <p>Lock Period: {blocksToDays(savings.value['lock-period']?.value || 0)} days</p>
              <p>Start Block: {savings.value['start-block']?.value || 0}</p>
              <p>Maturity Block: {savings.value['maturity-block']?.value || 0}</p>
              <p>Status: {savings.value['is-matured']?.value ? 'Matured ✅' : 'Locked 🔒'}</p>
            </div>
          ) : (
            <p>No active savings</p>
          )}
        </CardContent>
      </Card>

      {/* Reputation */}
      <Card>
        <CardHeader>
          <CardTitle>Reputation</CardTitle>
        </CardHeader>
        <CardContent>
          {reputationLoading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p className="text-2xl font-bold">{reputation?.value || 0} points</p>
              {reputation?.value >= 1000 && (
                <p className="text-green-600 mt-2">🏆 Badge eligible!</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Make a Deposit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (STX)</label>
            <Input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Lock Period (blocks)</label>
            <Input
              type="number"
              value={lockPeriod}
              onChange={(e) => setLockPeriod(e.target.value)}
              placeholder="e.g., 4320 (30 days)"
            />
            <p className="text-xs text-gray-500 mt-1">
              ~144 blocks per day
            </p>
          </div>
          <Button 
            onClick={handleDeposit} 
            disabled={depositLoading || !depositAmount || !lockPeriod}
            className="w-full"
          >
            {depositLoading ? 'Processing...' : 'Deposit STX'}
          </Button>
          {depositTxId && (
            <p className="text-sm text-green-600">
              Transaction submitted: {depositTxId}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Withdraw */}
      {savings?.value && (
        <Card>
          <CardHeader>
            <CardTitle>Withdraw</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleWithdraw} 
              disabled={withdrawLoading || !savings.value['is-matured']?.value}
              className="w-full"
              variant={savings.value['is-matured']?.value ? 'default' : 'secondary'}
            >
              {withdrawLoading ? 'Processing...' : 'Withdraw STX'}
            </Button>
            {!savings.value['is-matured']?.value && (
              <p className="text-sm text-amber-600 mt-2">
                ⏳ Savings not yet matured
              </p>
            )}
            {withdrawTxId && (
              <p className="text-sm text-green-600 mt-2">
                Transaction submitted: {withdrawTxId}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
