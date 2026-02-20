'use client';

import { useState, useEffect } from 'react';
import { StacksTestnet } from '@stacks/network';

const network = new StacksTestnet();

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export function useTransaction() {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trackTransaction = async (transactionId: string) => {
    setTxId(transactionId);
    setStatus('pending');

    try {
      // Poll transaction status
      const pollStatus = async (): Promise<boolean> => {
        const response = await fetch(`${network.coreApiUrl}/extended/v1/tx/${transactionId}`);
        const tx = await response.json();
        
        if (tx.tx_status === 'success') {
          setStatus('success');
          return true;
        } else if (tx.tx_status === 'abort_by_response' || tx.tx_status === 'abort_by_post_condition') {
          setError(tx.tx_result?.repr || 'Transaction failed');
          setStatus('error');
          return true;
        }
        return false;
      };

      // Poll every 5 seconds for up to 5 minutes
      const maxAttempts = 60;
      let attempts = 0;
      
      const poll = async () => {
        const completed = await pollStatus();
        if (!completed && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000);
        } else if (attempts >= maxAttempts) {
          setError('Transaction timeout');
          setStatus('error');
        }
      };

      poll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track transaction');
      setStatus('error');
    }
  };

  const execute = async (fn: () => Promise<any>) => {
    setStatus('pending');
    setError(null);
    setTxId(null);

    try {
      const result = await fn();
      if (result.txId) {
        trackTransaction(result.txId);
      } else {
        setStatus('success');
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setStatus('error');
      throw err;
    }
  };

  const reset = () => {
    setStatus('idle');
    setTxId(null);
    setError(null);
  };

  return { status, txId, error, execute, reset, trackTransaction };
}
