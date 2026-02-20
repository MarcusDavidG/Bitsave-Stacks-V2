'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { LoadingSkeleton } from './loading-skeleton';

interface LoadingCardProps {
  message?: string;
  variant?: 'spinner' | 'skeleton';
  lines?: number;
  showHeader?: boolean;
}

export function LoadingCard({ 
  message = 'Loading...', 
  variant = 'spinner',
  lines = 3,
  showHeader = true 
}: LoadingCardProps) {
  if (variant === 'skeleton') {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <LoadingSkeleton variant="text" className="w-32" />
          </CardHeader>
        )}
        <CardContent className="space-y-3">
          <LoadingSkeleton variant="text" lines={lines} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-8 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </Card>
  );
}
