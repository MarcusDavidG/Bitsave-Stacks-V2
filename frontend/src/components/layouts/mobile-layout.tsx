'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MobileLayout({ children, className }: MobileLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      "px-4 py-6 md:px-6 md:py-8",
      "max-w-md mx-auto md:max-w-none",
      className
    )}>
      {/* Mobile-optimized spacing and layout */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
