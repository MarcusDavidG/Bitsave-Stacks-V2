"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { withdrawSTX, getUserSavings } from "@/lib/stacks";

interface WithdrawFormProps {
  userAddress?: string;
  isConnected?: boolean;
  onSuccess?: () => void;
}

interface SavingsData {
  amount: number;
  lockPeriod: number;
  startBlock: number;
  maturityBlock: number;
  isMatured: boolean;
}

export function WithdrawForm({ userAddress, isConnected, onSuccess }: WithdrawFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && userAddress) {
      fetchSavingsData();
    }
  }, [isConnected, userAddress]);

  const fetchSavingsData = async () => {
    if (!userAddress) return;
    
    setLoading(true);
    try {
      const data = await getUserSavings(userAddress);
      if (data?.value) {
        setSavingsData({
          amount: data.value.amount?.value || 0,
          lockPeriod: data.value['lock-period']?.value || 0,
          startBlock: data.value['start-block']?.value || 0,
          maturityBlock: data.value['maturity-block']?.value || 0,
          isMatured: data.value['is-matured']?.value || false
        });
      }
    } catch (error) {
      console.error('Error fetching savings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !savingsData?.isMatured) return;

    setIsSubmitting(true);
    try {
      await withdrawSTX();
      onSuccess?.();
      setSavingsData(null);
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    if (!savingsData) return 0;
    const currentBlock = 150000; // This should come from actual blockchain data
    const totalBlocks = savingsData.maturityBlock - savingsData.startBlock;
    const elapsedBlocks = currentBlock - savingsData.startBlock;
    return Math.min((elapsedBlocks / totalBlocks) * 100, 100);
  };

  const formatSTX = (amount: number) => {
    return (amount / 1000000).toFixed(6);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading savings data...
        </CardContent>
      </Card>
    );
  }

  if (!savingsData || savingsData.amount === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Withdraw STX
          </CardTitle>
          <CardDescription>
            No active savings found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You don't have any active savings to withdraw.</p>
            <p className="text-sm mt-2">Make a deposit first to start earning!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = calculateProgress();
  const estimatedReward = (savingsData.amount * 0.12 * (savingsData.lockPeriod / 4320)) / 1000000; // Rough calculation

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Withdraw STX
        </CardTitle>
        <CardDescription>
          Manage your locked savings and withdrawals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Savings Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Savings Status</span>
            <Badge variant={savingsData.isMatured ? "default" : "secondary"}>
              {savingsData.isMatured ? "Ready to Withdraw" : "Locked"}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Deposited</span>
              <p className="font-medium">{formatSTX(savingsData.amount)} STX</p>
            </div>
            <div>
              <span className="text-muted-foreground">Est. Reward</span>
              <p className="font-medium text-green-600">+{estimatedReward.toFixed(6)} STX</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Lock Period</span>
              <p className="font-medium">{Math.round(savingsData.lockPeriod / 144)} days</p>
            </div>
            <div>
              <span className="text-muted-foreground">Maturity Block</span>
              <p className="font-medium">{savingsData.maturityBlock.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Withdrawal Summary */}
        {savingsData.isMatured && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">Ready for Withdrawal</span>
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Total Amount: {(parseFloat(formatSTX(savingsData.amount)) + estimatedReward).toFixed(6)} STX
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleWithdraw}
          className="w-full" 
          disabled={!isConnected || !savingsData.isMatured || isSubmitting}
          size="lg"
          variant={savingsData.isMatured ? "default" : "secondary"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : savingsData.isMatured ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Withdraw Now
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Locked Until Maturity
            </>
          )}
        </Button>

        {!isConnected && (
          <p className="text-sm text-muted-foreground text-center">
            Connect your wallet to view your savings
          </p>
        )}
      </CardContent>
    </Card>
  );
}
