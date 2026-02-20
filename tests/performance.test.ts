import { describe, it, expect } from 'vitest';
import { StacksTestnet } from '@stacks/network';
import { callReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { BITSAVE_CONTRACT, BADGES_CONTRACT } from '../src/lib/constants';

const network = new StacksTestnet();

describe('BitSave Performance Tests', () => {
  const testUser = 'ST2QR5BT57BTVQM69ZFQBMW3BH7KDN3FX56H02TEW';
  
  describe('Response Time Tests', () => {
    it('should respond to read-only calls within acceptable time', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const startTime = Date.now();
      
      await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-reward-rate',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should respond within 5 seconds
      expect(responseTime).toBeLessThan(5000);
    });
    
    it('should handle multiple concurrent read calls efficiently', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const startTime = Date.now();
      
      // Make 5 concurrent calls
      const promises = Array(5).fill(null).map(() => 
        callReadOnlyFunction({
          network,
          contractAddress,
          contractName,
          functionName: 'get-contract-stats',
          functionArgs: [],
          senderAddress: testUser,
        })
      );
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // All calls should complete within 10 seconds
      expect(totalTime).toBeLessThan(10000);
    });
  });
  
  describe('Contract Efficiency Tests', () => {
    it('should have efficient gas usage for read operations', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Test multiple read operations
      const operations = [
        'get-reward-rate',
        'get-minimum-deposit',
        'is-paused',
        'get-contract-stats',
        'health-check'
      ];
      
      for (const operation of operations) {
        const startTime = Date.now();
        
        const result = await callReadOnlyFunction({
          network,
          contractAddress,
          contractName,
          functionName: operation,
          functionArgs: [],
          senderAddress: testUser,
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Each operation should be fast
        expect(responseTime).toBeLessThan(3000);
        expect(cvToValue(result)).toBeDefined();
      }
    });
  });
  
  describe('Badge Contract Performance', () => {
    it('should efficiently handle badge queries', async () => {
      const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
      
      const startTime = Date.now();
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-next-token-id',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(3000);
      expect(cvToValue(result)).toBeDefined();
    });
  });
  
  describe('Load Testing Simulation', () => {
    it('should handle rapid sequential calls', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const startTime = Date.now();
      const results = [];
      
      // Make 10 rapid sequential calls
      for (let i = 0; i < 10; i++) {
        const result = await callReadOnlyFunction({
          network,
          contractAddress,
          contractName,
          functionName: 'get-reward-rate',
          functionArgs: [],
          senderAddress: testUser,
        });
        results.push(cvToValue(result));
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / 10;
      
      // All calls should succeed
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.value).toBe(10n);
      });
      
      // Average response time should be reasonable
      expect(avgTime).toBeLessThan(2000);
    });
  });
  
  describe('Memory and Resource Usage', () => {
    it('should handle complex data queries efficiently', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const startTime = Date.now();
      
      // Query complex data structures
      const statsResult = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-contract-stats',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const metricsResult = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-performance-metrics',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(5000);
      expect(cvToValue(statsResult)).toBeDefined();
      expect(cvToValue(metricsResult)).toBeDefined();
    });
  });
});
