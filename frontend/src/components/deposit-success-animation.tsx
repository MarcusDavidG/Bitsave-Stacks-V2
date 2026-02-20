'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepositSuccessAnimationProps {
  show: boolean;
  amount?: string;
  onComplete?: () => void;
}

export function DepositSuccessAnimation({ show, amount, onComplete }: DepositSuccessAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (show) {
      setStage(1);
      const timer1 = setTimeout(() => setStage(2), 500);
      const timer2 = setTimeout(() => setStage(3), 1500);
      const timer3 = setTimeout(() => {
        setStage(0);
        onComplete?.();
      }, 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
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
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          )}
        </div>
        
        <h3 className={cn(
          "text-xl font-semibold mt-4 transition-all duration-500",
          stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          Deposit Successful!
        </h3>
        
        {amount && (
          <p className={cn(
            "text-gray-600 mt-2 transition-all duration-500 delay-200",
            stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            {amount} STX deposited
          </p>
        )}
      </div>
    </div>
  );
}
