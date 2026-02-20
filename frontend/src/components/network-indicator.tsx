'use client';

import { Badge } from '@/components/ui/badge';
import { CURRENT_NETWORK } from '@/lib/network';

export function NetworkIndicator() {
  return (
    <Badge variant={CURRENT_NETWORK === 'testnet' ? 'secondary' : 'default'}>
      {CURRENT_NETWORK.toUpperCase()}
    </Badge>
  );
}
