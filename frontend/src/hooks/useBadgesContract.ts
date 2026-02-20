/**
 * React Hooks for BitSave Badges Contract Integration
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getBadgeOwner,
  getBadgeMetadata,
  getNextTokenId,
  transferBadge,
  burnBadge
} from '../lib/bitsave-integration';

// ============================================
// READ HOOKS
// ============================================

export function useBadgeOwner(tokenId?: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (tokenId === undefined) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getBadgeOwner(tokenId);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useBadgeMetadata(tokenId?: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (tokenId === undefined) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getBadgeMetadata(tokenId);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useNextTokenId() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getNextTokenId();
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

export function useTransferBadge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const execute = async (tokenId: number, sender: string, recipient: string) => {
    setLoading(true);
    setError(null);
    setTxId(null);
    
    try {
      const result = await transferBadge(tokenId, sender, recipient);
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

export function useBurnBadge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const execute = async (tokenId: number) => {
    setLoading(true);
    setError(null);
    setTxId(null);
    
    try {
      const result = await burnBadge(tokenId);
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
