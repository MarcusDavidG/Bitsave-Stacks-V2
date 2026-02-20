// Contract Call Hook
import { useEffect, useState } from 'react';
import { callReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { BITSAVE_CONTRACT } from '../lib/constants';

const network = new StacksTestnet();

export function useContractCall(functionName: string, args: any[] = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = async (userAddress?: string) => {
    if (!userAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs: args,
        senderAddress: userAddress,
      });
      
      setData(cvToValue(result));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, call };
}
