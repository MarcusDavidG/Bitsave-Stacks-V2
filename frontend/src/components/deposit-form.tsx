"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Loader2, Clock } from "lucide-react";
import { depositSTX } from "@/lib/stacks";

interface DepositFormProps {
  userAddress?: string;
  isConnected?: boolean;
  onSuccess?: () => void;
}

export function DepositForm({ userAddress, isConnected, onSuccess }: DepositFormProps) {
  const [amount, setAmount] = useState("");
  const [lockPeriod, setLockPeriod] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lockPeriods = [
    { days: 7, blocks: 1008, apy: "8%" },
    { days: 30, blocks: 4320, apy: "12%" },
    { days: 90, blocks: 12960, apy: "18%" },
    { days: 180, blocks: 25920, apy: "25%" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !amount || !lockPeriod) return;

    setIsSubmitting(true);
    try {
      await depositSTX(parseFloat(amount), parseInt(lockPeriod));
      onSuccess?.();
      setAmount("");
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPeriod = lockPeriods.find(p => p.blocks.toString() === lockPeriod);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Deposit STX
        </CardTitle>
        <CardDescription>
          Lock your STX tokens and earn guaranteed returns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (STX)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to deposit"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.000001"
              disabled={!isConnected}
            />
          </div>

          {/* Lock Period Selection */}
          <div className="space-y-3">
            <Label>Lock Period</Label>
            <div className="grid grid-cols-2 gap-2">
              {lockPeriods.map((period) => (
                <button
                  key={period.blocks}
                  type="button"
                  onClick={() => setLockPeriod(period.blocks.toString())}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    lockPeriod === period.blocks.toString()
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  disabled={!isConnected}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{period.days} days</span>
                    <Badge variant="secondary">{period.apy}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {period.blocks.toLocaleString()} blocks
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {amount && selectedPeriod && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Deposit Amount:</span>
                <span className="font-medium">{amount} STX</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Lock Period:</span>
                <span className="font-medium">{selectedPeriod.days} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Expected APY:</span>
                <span className="font-medium text-green-600">{selectedPeriod.apy}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span>Estimated Rewards:</span>
                <span className="font-medium">
                  {(parseFloat(amount) * (parseFloat(selectedPeriod.apy) / 100) * (selectedPeriod.days / 365)).toFixed(6)} STX
                </span>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isConnected || !amount || !lockPeriod || isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Lock & Earn
              </>
            )}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Connect your wallet to start depositing
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
