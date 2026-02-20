"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Medal, Trophy, Star } from "lucide-react";

export function BadgeShowcase() {
  const badges = [
    {
      id: 1,
      name: "First Deposit",
      description: "Made your first STX deposit",
      icon: Star,
      rarity: "Common",
      color: "bg-blue-500",
      earned: true
    },
    {
      id: 2,
      name: "Loyal Saver",
      description: "Reached 1000+ reputation points",
      icon: Award,
      rarity: "Rare",
      color: "bg-yellow-500",
      earned: false,
      requirement: "1000 reputation points"
    },
    {
      id: 3,
      name: "Diamond Hands",
      description: "Completed a 180-day lock period",
      icon: Medal,
      rarity: "Epic",
      color: "bg-purple-500",
      earned: false,
      requirement: "Complete 180-day lock"
    },
    {
      id: 4,
      name: "Whale Saver",
      description: "Deposited over 10,000 STX",
      icon: Trophy,
      rarity: "Legendary",
      color: "bg-orange-500",
      earned: false,
      requirement: "Deposit 10,000+ STX"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "Rare": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Epic": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Legendary": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Achievement Badges
        </CardTitle>
        <CardDescription>
          Collect NFT badges by reaching savings milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border transition-all ${
                  badge.earned 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${badge.color} text-white flex-shrink-0`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{badge.name}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getRarityColor(badge.rarity)}`}
                      >
                        {badge.rarity}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {badge.description}
                    </p>
                    
                    {badge.earned ? (
                      <Badge variant="default" className="text-xs">
                        ✓ Earned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {badge.requirement}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">About NFT Badges</h4>
          <p className="text-sm text-muted-foreground">
            Achievement badges are minted as NFTs on the Stacks blockchain when you reach specific milestones. 
            These collectible tokens serve as proof of your commitment to saving and can be traded or displayed 
            in your wallet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
