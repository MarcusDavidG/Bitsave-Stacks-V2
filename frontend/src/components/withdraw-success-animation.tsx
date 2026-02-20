'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Trophy, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WithdrawSuccessAnimationProps {
  show: boolean;
  amount?: string;
  earnedPoints?: number;
  onComplete?: () => void;
}

export function WithdrawSuccessAnimation({ 
  show, 
  amount, 
  earnedPoints, 
  onComplete 
}: WithdrawSuccessAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (show) {
      setStage(1);
      const timer1 = setTimeout(() => setStage(2), 500);
      const timer2 = setTimeout(() => setStage(3), 1500);
      const timer3 = setTimeout(() => setStage(4), 2500);
      const timer4 = setTimeout(() => {
        setStage(0);
        onComplete?.();
      }, 4000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
        <div className="relative">
          <CheckCircle 
            className={cn(
              "w-16 h-16 mx-auto text-green-500 transition-all duration-500",
              stage >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )} 
          />
          
          {stage >= 2 && (
            <div className="absolute -top-2 -right-2">
              <Coins className="w-8 h-8 text-yellow-500 animate-bounce" />
            </div>
          )}
        </div>
        
        <h3 className={cn(
          "text-xl font-semibold mt-4 transition-all duration-500",
          stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          Withdrawal Complete!
        </h3>
        
        {amount && (
          <p className={cn(
            "text-gray-600 mt-2 transition-all duration-500 delay-200",
            stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {amount} STX withdrawn
          </p>
        )}

        {earnedPoints && (
          <div className={cn(
            "flex items-center justify-center mt-3 text-blue-600 transition-all duration-500 delay-400",
            stage >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <Trophy className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">+{earnedPoints} reputation points</span>
          </div>
        )}
      </div>
    </div>
  );
}
