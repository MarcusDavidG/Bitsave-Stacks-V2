// Contract Read Hook
import { useEffect, useState } from 'react';
import { callReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { BITSAVE_CONTRACT } from '../lib/constants';

const network = new StacksTestnet();

export function useContractRead(functionName: string, userAddress?: string, autoRefresh = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!userAddress) return;
    
    setLoading(true);
    try {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs: [],
        senderAddress: userAddress,
      });
      
      setData(cvToValue(result));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetchData();
      
      if (autoRefresh) {
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
      }
    }
  }, [userAddress, functionName, autoRefresh]);

  return { data, loading, error, refetch: fetchData };
}
