'use client';

import { useContractRead } from './useContractRead';
import type { ReputationInfo } from '@/types/contracts';

export function useReputation(address: string | null) {
  const { data, loading, error, refetch } = useContractRead('get-reputation', address || undefined);
  
  return {
    reputation: data?.value as ReputationInfo | null,
    loading,
    error: error?.message || null,
    refetch
  };
}
