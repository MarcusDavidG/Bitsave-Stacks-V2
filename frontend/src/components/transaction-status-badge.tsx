'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransactionStatus } from '@/hooks/useTransaction';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  txId?: string | null;
  className?: string;
}

export function TransactionStatusBadge({ status, txId, className }: TransactionStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          variant: 'secondary' as const,
          className: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };
      case 'success':
        return {
          icon: CheckCircle,
          text: 'Success',
          variant: 'default' as const,
          className: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: XCircle,
          text: 'Failed',
          variant: 'destructive' as const,
          className: 'text-red-600 bg-red-50 border-red-200'
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Ready',
          variant: 'outline' as const,
          className: 'text-gray-600 bg-gray-50 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
      {txId && (
        <span className="ml-1 text-xs opacity-70">
          {txId.slice(0, 8)}...
        </span>
      )}
    </Badge>
  );
}
