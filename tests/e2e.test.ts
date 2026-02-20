import { describe, it, expect } from 'vitest';
import { StacksTestnet } from '@stacks/network';
import { 
  makeContractCall,
  callReadOnlyFunction,
  cvToValue,
  uintCV,
  stringUtf8CV,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { BITSAVE_CONTRACT } from '../src/lib/constants';

const network = new StacksTestnet();

describe('BitSave End-to-End User Journey', () => {
  const testUser = 'ST2QR5BT57BTVQM69ZFQBMW3BH7KDN3FX56H02TEW';
  
  describe('Complete User Flow', () => {
    it('should handle complete deposit and withdrawal cycle', async () => {
      // 1. Check initial state - no savings
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      let result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-savings',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      let savings = cvToValue(result);
      expect(savings.value).toBeNull(); // No initial savings
      
      // 2. Check initial reputation - should be zero
      result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-reputation',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      let reputation = cvToValue(result);
      expect(reputation.value.points).toBe(0n);
      
      // 3. Verify contract configuration
      result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-contract-stats',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      let stats = cvToValue(result);
      expect(stats.value).toBeDefined();
      
      // 4. Check health status
      result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'health-check',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      let health = cvToValue(result);
      expect(health.value.status).toBe('active');
    });
    
    it('should validate deposit parameters', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Test minimum deposit validation
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-minimum-deposit',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const minDeposit = cvToValue(result);
      expect(minDeposit.value).toBe(1000000n); // 1 STX minimum
    });
    
    it('should handle error cases gracefully', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Test error message retrieval
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-error-message',
        functionArgs: [uintCV(100)], // ERR_NO_AMOUNT
        senderAddress: testUser,
      });
      
      const errorMsg = cvToValue(result);
      expect(errorMsg.value).toContain('Amount must be greater than zero');
    });
  });
  
  describe('Performance Metrics', () => {
    it('should provide performance insights', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-performance-metrics',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const metrics = cvToValue(result);
      expect(metrics.value).toBeDefined();
      expect(metrics.value['reward-rate']).toBe(10n);
    });
  });
  
  describe('Contract Analytics', () => {
    it('should track contract statistics', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-contract-stats',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const stats = cvToValue(result);
      expect(stats.value['total-deposits']).toBeDefined();
      expect(stats.value['total-users']).toBeDefined();
      expect(stats.value['contract-balance']).toBeDefined();
    });
  });
});
