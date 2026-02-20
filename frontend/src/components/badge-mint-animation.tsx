'use client';

import { useEffect, useState } from 'react';
import { Award, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeMintAnimationProps {
  show: boolean;
  badgeName?: string;
  tier?: string;
  onComplete?: () => void;
}

export function BadgeMintAnimation({ 
  show, 
  badgeName = "Loyal Saver", 
  tier = "Gold",
  onComplete 
}: BadgeMintAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (show) {
      setStage(1);
      const timer1 = setTimeout(() => setStage(2), 300);
      const timer2 = setTimeout(() => setStage(3), 800);
      const timer3 = setTimeout(() => setStage(4), 1500);
      const timer4 = setTimeout(() => {
        setStage(0);
        onComplete?.();
      }, 3500);

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-8 max-w-sm mx-4 text-center border-2 border-yellow-200">
        <div className="relative">
          {/* Sparkle effects */}
          {stage >= 2 && (
            <>
              <Sparkles className="absolute -top-4 -left-4 w-6 h-6 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -top-2 -right-6 w-4 h-4 text-orange-400 animate-pulse delay-200" />
              <Star className="absolute -bottom-2 -left-2 w-5 h-5 text-yellow-500 animate-pulse delay-400" />
            </>
          )}
          
          <Award 
            className={cn(
              "w-20 h-20 mx-auto text-yellow-500 transition-all duration-700",
              stage >= 1 ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 rotate-180"
            )} 
          />
        </div>
        
        <h3 className={cn(
          "text-2xl font-bold mt-4 text-yellow-700 transition-all duration-500",
          stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          🎉 Badge Earned!
        </h3>
        
        <div className={cn(
          "mt-3 transition-all duration-500 delay-200",
          stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <p className="text-lg font-semibold text-gray-800">{badgeName}</p>
          <p className="text-sm text-gray-600">{tier} Tier</p>
        </div>

        <p className={cn(
          "text-xs text-gray-500 mt-4 transition-all duration-500 delay-400",
          stage >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          Your achievement has been minted as an NFT!
        </p>
      </div>
    </div>
  );
}
