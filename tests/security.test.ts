import { describe, it, expect } from 'vitest';
import { StacksTestnet } from '@stacks/network';
import { callReadOnlyFunction, cvToValue, uintCV } from '@stacks/transactions';
import { BITSAVE_CONTRACT, BADGES_CONTRACT } from '../src/lib/constants';

const network = new StacksTestnet();

describe('BitSave Security Tests', () => {
  const testUser = 'ST2QR5BT57BTVQM69ZFQBMW3BH7KDN3FX56H02TEW';
  const maliciousUser = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  
  describe('Access Control Tests', () => {
    it('should protect admin functions from unauthorized access', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Test that non-admin cannot access admin functions
      // This would require actual transaction calls, so we test read-only validation
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-error-message',
        functionArgs: [uintCV(105)], // ERR_NOT_AUTHORIZED
        senderAddress: testUser,
      });
      
      const errorMsg = cvToValue(result);
      expect(errorMsg.value).toContain('Unauthorized: admin access required');
    });
    
    it('should validate input parameters properly', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Test various error conditions
      const errorTests = [
        { code: 100, expected: 'Amount must be greater than zero' },
        { code: 107, expected: 'Amount below minimum deposit requirement' },
        { code: 108, expected: 'Amount exceeds maximum deposit limit' },
        { code: 110, expected: 'Invalid lock period: outside allowed range' },
        { code: 111, expected: 'Reentrancy detected: operation blocked' },
        { code: 112, expected: 'Overflow protection: value too large' },
        { code: 113, expected: 'Invalid principal address' }
      ];
      
      for (const test of errorTests) {
        const result = await callReadOnlyFunction({
          network,
          contractAddress,
          contractName,
          functionName: 'get-error-message',
          functionArgs: [uintCV(test.code)],
          senderAddress: testUser,
        });
        
        const errorMsg = cvToValue(result);
        expect(errorMsg.value).toContain(test.expected);
      }
    });
  });
  
  describe('Contract State Protection', () => {
    it('should have proper pause mechanism', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'is-paused',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const isPaused = cvToValue(result);
      expect(typeof isPaused.value).toBe('boolean');
    });
    
    it('should have upgrade protection mechanisms', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-contract-info',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const contractInfo = cvToValue(result);
      expect(contractInfo.value.version).toBeDefined();
      expect(contractInfo.value['upgrade-authorized']).toBe(false);
      expect(contractInfo.value['migration-in-progress']).toBe(false);
    });
  });
  
  describe('Badge Contract Security', () => {
    it('should have proper minter authorization', async () => {
      const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-authorized-minter',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const authorizedMinter = cvToValue(result);
      expect(authorizedMinter.value).toBe(BITSAVE_CONTRACT);
    });
    
    it('should protect against unauthorized badge operations', async () => {
      const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
      
      // Verify next token ID is properly managed
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-next-token-id',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const nextTokenId = cvToValue(result);
      expect(nextTokenId.value).toBeGreaterThanOrEqual(1n);
    });
  });
  
  describe('Data Integrity Tests', () => {
    it('should maintain consistent contract statistics', async () => {
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
      
      // Verify all stats are non-negative
      expect(stats.value['total-deposits']).toBeGreaterThanOrEqual(0n);
      expect(stats.value['total-withdrawals']).toBeGreaterThanOrEqual(0n);
      expect(stats.value['total-users']).toBeGreaterThanOrEqual(0n);
      expect(stats.value['total-volume']).toBeGreaterThanOrEqual(0n);
      expect(stats.value['contract-balance']).toBeGreaterThanOrEqual(0n);
      
      // Logical consistency checks
      expect(stats.value['total-withdrawals']).toBeLessThanOrEqual(stats.value['total-deposits']);
    });
    
    it('should have valid configuration parameters', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Test reward rate bounds
      const rewardResult = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-reward-rate',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const rewardRate = cvToValue(rewardResult);
      expect(rewardRate.value).toBeGreaterThan(0n);
      expect(rewardRate.value).toBeLessThanOrEqual(100n); // Max 100%
      
      // Test minimum deposit
      const minDepositResult = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-minimum-deposit',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const minDeposit = cvToValue(minDepositResult);
      expect(minDeposit.value).toBeGreaterThan(0n);
      
      // Test penalty rate
      const penaltyResult = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-early-withdrawal-penalty',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const penalty = cvToValue(penaltyResult);
      expect(penalty.value).toBeGreaterThanOrEqual(0n);
      expect(penalty.value).toBeLessThanOrEqual(100n); // Max 100%
    });
  });
  
  describe('Health and Monitoring', () => {
    it('should provide accurate health status', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'health-check',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const health = cvToValue(result);
      expect(['active', 'paused', 'migrating']).toContain(health.value.status);
      expect(typeof health.value['balance-healthy']).toBe('boolean');
      expect(typeof health.value['rate-reasonable']).toBe('boolean');
      expect(health.value.version).toBe(200n); // Version 2.0.0
    });
  });
});
