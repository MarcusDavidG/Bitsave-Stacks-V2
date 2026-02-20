"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, Star, Trophy } from "lucide-react";
import { getUserReputation } from "@/lib/stacks";

interface ReputationDashboardProps {
  userAddress?: string;
  isConnected?: boolean;
}

export function ReputationDashboard({ userAddress, isConnected }: ReputationDashboardProps) {
  const [reputation, setReputation] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && userAddress) {
      fetchReputation();
    }
  }, [isConnected, userAddress]);

  const fetchReputation = async () => {
    if (!userAddress) return;
    
    setLoading(true);
    try {
      const data = await getUserReputation(userAddress);
      setReputation(data?.value || 0);
    } catch (error) {
      console.error('Error fetching reputation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReputationLevel = (points: number) => {
    if (points >= 10000) return { level: "Diamond", color: "bg-blue-500", icon: Trophy };
    if (points >= 5000) return { level: "Platinum", color: "bg-purple-500", icon: Award };
    if (points >= 1000) return { level: "Gold", color: "bg-yellow-500", icon: Star };
    if (points >= 100) return { level: "Silver", color: "bg-gray-400", icon: TrendingUp };
    return { level: "Bronze", color: "bg-orange-500", icon: Award };
  };

  const getNextLevelProgress = (points: number) => {
    if (points >= 10000) return { progress: 100, nextLevel: "Max Level", pointsNeeded: 0 };
    if (points >= 5000) return { progress: ((points - 5000) / 5000) * 100, nextLevel: "Diamond", pointsNeeded: 10000 - points };
    if (points >= 1000) return { progress: ((points - 1000) / 4000) * 100, nextLevel: "Platinum", pointsNeeded: 5000 - points };
    if (points >= 100) return { progress: ((points - 100) / 900) * 100, nextLevel: "Gold", pointsNeeded: 1000 - points };
    return { progress: (points / 100) * 100, nextLevel: "Silver", pointsNeeded: 100 - points };
  };

  const reputationLevel = getReputationLevel(reputation);
  const nextLevel = getNextLevelProgress(reputation);
  const IconComponent = reputationLevel.icon;

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Reputation Dashboard
          </CardTitle>
          <CardDescription>
            Connect your wallet to view your reputation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Connect your wallet to see your reputation score and achievements.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Reputation Dashboard
        </CardTitle>
        <CardDescription>
          Track your savings reputation and unlock achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className={`p-4 rounded-full ${reputationLevel.color} text-white`}>
              <IconComponent className="h-8 w-8" />
            </div>
          </div>
          
          <div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {reputationLevel.level}
            </Badge>
            <p className="text-2xl font-bold mt-2">{reputation.toLocaleString()} Points</p>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel.pointsNeeded > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextLevel.nextLevel}</span>
              <span>{nextLevel.progress.toFixed(1)}%</span>
            </div>
            <Progress value={nextLevel.progress} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {nextLevel.pointsNeeded.toLocaleString()} points needed for {nextLevel.nextLevel}
            </p>
          </div>
        )}

        {/* Reputation Benefits */}
        <div className="space-y-3">
          <h4 className="font-medium">Level Benefits</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Badge Eligibility</span>
              <Badge variant={reputation >= 1000 ? "default" : "secondary"}>
                {reputation >= 1000 ? "Eligible" : "Need 1000+ points"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Bonus APY</span>
              <span className="font-medium">+{Math.floor(reputation / 1000)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Priority Support</span>
              <Badge variant={reputation >= 5000 ? "default" : "secondary"}>
                {reputation >= 5000 ? "Active" : "Need 5000+ points"}
              </Badge>
            </div>
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">How to Earn Points</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Complete savings cycles: +100 points per cycle</li>
            <li>• Longer lock periods: +50 bonus points per month</li>
            <li>• Larger deposits: +10 points per 1000 STX</li>
            <li>• Consecutive cycles: +25% bonus multiplier</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
