'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function LoadingButton({ 
  loading = false, 
  children, 
  className, 
  disabled,
  onClick 
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 rounded-md",
        "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
        "transition-colors duration-200",
        className
      )}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
