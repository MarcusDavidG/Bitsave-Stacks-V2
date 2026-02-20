'use client';

import { useContractRead } from './useContractRead';
import type { SavingsInfo } from '@/types/contracts';

export function useSavings(address: string | null) {
  const { data, loading, error, refetch } = useContractRead('get-savings', address || undefined);
  
  return {
    savings: data?.value as SavingsInfo | null,
    loading,
    error: error?.message || null,
    refetch
  };
}
