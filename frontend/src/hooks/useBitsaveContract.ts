/**
 * React Hooks for BitSave Contract Integration
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSavings,
  getReputation,
  getRewardRate,
  getContractStats,
  deposit,
  withdraw,
  depositWithGoal
} from '../lib/bitsave-integration';

// ============================================
// READ HOOKS
// ============================================

export function useSavingsData(userAddress?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!userAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getSavings(userAddress);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useReputationData(userAddress?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!userAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getReputation(userAddress);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useRewardRateData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRewardRate();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useContractStatsData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getContractStats();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ============================================
// WRITE HOOKS
// ============================================

export function useDeposit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const execute = async (amount: number, lockPeriod: number) => {
    setLoading(true);
    setError(null);
    setTxId(null);
    
    try {
      const result = await deposit(amount, lockPeriod);
      setTxId(result.txId);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, txId };
}

export function useDepositWithGoal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const execute = async (
    amount: number,
    lockPeriod: number,
    goalAmount: number,
    goalDescription: string
  ) => {
    setLoading(true);
    setError(null);
    setTxId(null);
    
    try {
      const result = await depositWithGoal(amount, lockPeriod, goalAmount, goalDescription);
      setTxId(result.txId);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, txId };
}

export function useWithdraw() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    setTxId(null);
    
    try {
      const result = await withdraw();
      setTxId(result.txId);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error, txId };
}
