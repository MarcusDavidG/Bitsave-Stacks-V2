import { describe, it, expect } from 'vitest';
import { StacksTestnet } from '@stacks/network';
import { callReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { BITSAVE_CONTRACT, BADGES_CONTRACT } from '../src/lib/constants';

const network = new StacksTestnet();

describe('BitSave User Acceptance Tests', () => {
  const testUser = 'ST2QR5BT57BTVQM69ZFQBMW3BH7KDN3FX56H02TEW';
  
  describe('User Experience Validation', () => {
    it('should provide clear contract information for users', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Users should be able to easily understand contract terms
      const rewardResult = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-reward-rate',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const minDepositResult = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-minimum-deposit',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const penaltyResult = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-early-withdrawal-penalty',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const rewardRate = cvToValue(rewardResult);
      const minDeposit = cvToValue(minDepositResult);
      const penalty = cvToValue(penaltyResult);
      
      // Contract terms should be reasonable and user-friendly
      expect(rewardRate.value).toBe(10n); // 10% APY is attractive
      expect(minDeposit.value).toBe(1000000n); // 1 STX minimum is accessible
      expect(penalty.value).toBe(20n); // 20% penalty is fair deterrent
    });
    
    it('should provide helpful error messages for users', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Test user-friendly error messages
      const commonErrors = [
        { code: 100, scenario: 'User tries to deposit 0 STX' },
        { code: 101, scenario: 'User tries to deposit when already has savings' },
        { code: 104, scenario: 'User tries to withdraw without deposit' },
        { code: 107, scenario: 'User tries to deposit below minimum' },
        { code: 109, scenario: 'User tries to withdraw during cooldown' }
      ];
      
      for (const error of commonErrors) {
        const result = await callReadOnlyFunction({
          network,
          contractAddress,
          contractName,
          functionName: 'get-error-message',
          functionArgs: [{ type: 'uint', value: BigInt(error.code) }],
          senderAddress: testUser,
        });
        
        const errorMsg = cvToValue(result);
        expect(errorMsg.value).toBeDefined();
        expect(errorMsg.value.length).toBeGreaterThan(10); // Meaningful message
      }
    });
  });
  
  describe('Feature Completeness', () => {
    it('should support all core user features', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Core features users expect
      const coreFeatures = [
        'get-savings',
        'get-reputation', 
        'get-reward-rate',
        'get-minimum-deposit',
        'get-contract-stats',
        'health-check'
      ];
      
      for (const feature of coreFeatures) {
        const result = await callReadOnlyFunction({
          network,
          contractAddress,
          contractName,
          functionName: feature,
          functionArgs: [],
          senderAddress: testUser,
        });
        
        expect(cvToValue(result)).toBeDefined();
      }
    });
    
    it('should support badge system for user engagement', async () => {
      const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
      
      // Badge features for gamification
      const badgeFeatures = [
        'get-next-token-id',
        'get-authorized-minter'
      ];
      
      for (const feature of badgeFeatures) {
        const result = await callReadOnlyFunction({
          network,
          contractAddress,
          contractName,
          functionName: feature,
          functionArgs: [],
          senderAddress: testUser,
        });
        
        expect(cvToValue(result)).toBeDefined();
      }
    });
  });
  
  describe('Performance Expectations', () => {
    it('should meet user performance expectations', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const startTime = Date.now();
      
      // Simulate typical user actions
      await Promise.all([
        callReadOnlyFunction({
          network,
          contractAddress,
          contractName,
          functionName: 'get-savings',
          functionArgs: [],
          senderAddress: testUser,
        }),
        callReadOnlyFunction({
          network,
          contractAddress,
          contractName,
          functionName: 'get-reputation',
          functionArgs: [],
          senderAddress: testUser,
        }),
        callReadOnlyFunction({
          network,
          contractAddress,
          contractName,
          functionName: 'get-contract-stats',
          functionArgs: [],
          senderAddress: testUser,
        })
      ]);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should feel responsive to users (under 3 seconds)
      expect(responseTime).toBeLessThan(3000);
    });
  });
  
  describe('Trust and Transparency', () => {
    it('should provide transparent contract information', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Users should be able to verify contract state
      const contractInfo = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-contract-info',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const stats = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-contract-stats',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const health = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'health-check',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const info = cvToValue(contractInfo);
      const statsData = cvToValue(stats);
      const healthData = cvToValue(health);
      
      // Contract should be transparent about its state
      expect(info.value.version).toBe(200n);
      expect(statsData.value['contract-balance']).toBeGreaterThanOrEqual(0n);
      expect(healthData.value.status).toBe('active');
    });
    
    it('should show accurate performance metrics', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const metrics = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-performance-metrics',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const metricsData = cvToValue(metrics);
      
      // Metrics should be realistic and helpful
      expect(metricsData.value['reward-rate']).toBe(10n);
      expect(metricsData.value['current-tvl']).toBeGreaterThanOrEqual(0n);
      expect(metricsData.value['utilization-rate']).toBeGreaterThanOrEqual(0n);
    });
  });
  
  describe('Accessibility and Usability', () => {
    it('should handle edge cases gracefully', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Test querying non-existent user data
      const savings = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-savings',
        functionArgs: [],
        senderAddress: 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE', // Different user
      });
      
      const reputation = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-reputation',
        functionArgs: [],
        senderAddress: 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE',
      });
      
      // Should handle gracefully without errors
      expect(cvToValue(savings)).toBeDefined();
      expect(cvToValue(reputation)).toBeDefined();
    });
  });
  
  describe('Business Logic Validation', () => {
    it('should implement sound financial logic', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      // Verify compound frequency is reasonable
      const frequency = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-compound-frequency',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const frequencyData = cvToValue(frequency);
      expect(frequencyData.value).toBe(12n); // Monthly compounding
      
      // Verify max deposit limit exists
      const maxDeposit = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-max-deposit-per-user',
        functionArgs: [],
        senderAddress: testUser,
      });
      
      const maxDepositData = cvToValue(maxDeposit);
      expect(maxDepositData.value).toBeGreaterThan(1000000n); // More than minimum
    });
  });
});
