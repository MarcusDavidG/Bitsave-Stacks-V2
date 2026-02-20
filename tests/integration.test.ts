import { describe, it, expect, beforeAll } from 'vitest';
import { StacksTestnet } from '@stacks/network';
import { callReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { BITSAVE_CONTRACT, BADGES_CONTRACT } from '../src/lib/constants';

const network = new StacksTestnet();
const testAddress = 'ST2QR5BT57BTVQM69ZFQBMW3BH7KDN3FX56H02TEW';

describe('BitSave Integration Tests', () => {
  beforeAll(async () => {
    // Wait for contracts to be fully deployed
    await new Promise(resolve => setTimeout(resolve, 5000));
  });

  describe('Contract Deployment', () => {
    it('should have bitsave contract deployed', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-reward-rate',
        functionArgs: [],
        senderAddress: testAddress,
      });

      const rewardRate = cvToValue(result);
      expect(rewardRate).toBeDefined();
      expect(rewardRate.value).toBe(10n); // 10% default rate
    });

    it('should have badges contract deployed', async () => {
      const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-next-token-id',
        functionArgs: [],
        senderAddress: testAddress,
      });

      const nextTokenId = cvToValue(result);
      expect(nextTokenId).toBeDefined();
      expect(nextTokenId.value).toBe(1n); // First token ID
    });
  });

  describe('Contract Configuration', () => {
    it('should have correct minimum deposit', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-minimum-deposit',
        functionArgs: [],
        senderAddress: testAddress,
      });

      const minDeposit = cvToValue(result);
      expect(minDeposit.value).toBe(1000000n); // 1 STX in microSTX
    });

    it('should not be paused initially', async () => {
      const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'is-paused',
        functionArgs: [],
        senderAddress: testAddress,
      });

      const isPaused = cvToValue(result);
      expect(isPaused.value).toBe(false);
    });
  });

  describe('Badge Authorization', () => {
    it('should have bitsave contract as authorized minter', async () => {
      const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
      
      const result = await callReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: 'get-authorized-minter',
        functionArgs: [],
        senderAddress: testAddress,
      });

      const authorizedMinter = cvToValue(result);
      expect(authorizedMinter.value).toBe(BITSAVE_CONTRACT);
    });
  });
});
