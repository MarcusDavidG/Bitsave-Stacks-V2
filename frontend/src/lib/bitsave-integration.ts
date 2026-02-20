/**
 * BitSave Smart Contract Integration
 * Complete integration layer for BitSave and BitSave Badges contracts
 */

import { 
  openContractCall, 
  showConnect 
} from '@stacks/connect';
import { 
  callReadOnlyFunction,
  cvToValue,
  uintCV,
  stringUtf8CV,
  standardPrincipalCV,
  PostConditionMode
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { BITSAVE_CONTRACT, BADGES_CONTRACT } from './constants';

const network = new StacksTestnet();

// ============================================
// WALLET CONNECTION
// ============================================

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'BitSave',
      icon: window.location.origin + '/favicon.ico',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
  });
};

// ============================================
// BITSAVE CONTRACT - WRITE FUNCTIONS
// ============================================

export async function deposit(amount: number, lockPeriod: number) {
  const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
  
  return openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 'deposit',
    functionArgs: [uintCV(amount), uintCV(lockPeriod)],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Deposit TX:', data.txId);
      return data;
    },
  });
}

export async function depositWithGoal(
  amount: number,
  lockPeriod: number,
  goalAmount: number,
  goalDescription: string
) {
  const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
  
  return openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 'deposit-with-goal',
    functionArgs: [
      uintCV(amount),
      uintCV(lockPeriod),
      uintCV(goalAmount),
      stringUtf8CV(goalDescription)
    ],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Deposit with goal TX:', data.txId);
      return data;
    },
  });
}

export async function withdraw() {
  const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
  
  return openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 'withdraw',
    functionArgs: [],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Withdraw TX:', data.txId);
      return data;
    },
  });
}

// ============================================
// BITSAVE CONTRACT - READ FUNCTIONS
// ============================================

export async function getSavings(userAddress: string) {
  const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
  
  const result = await callReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-savings',
    functionArgs: [standardPrincipalCV(userAddress)],
    senderAddress: userAddress,
  });
  
  return cvToValue(result);
}

export async function getReputation(userAddress: string) {
  const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
  
  const result = await callReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-reputation',
    functionArgs: [standardPrincipalCV(userAddress)],
    senderAddress: userAddress,
  });
  
  return cvToValue(result);
}

export async function getRewardRate() {
  const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
  
  const result = await callReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-reward-rate',
    functionArgs: [],
    senderAddress: contractAddress,
  });
  
  return cvToValue(result);
}

export async function getContractStats() {
  const [contractAddress, contractName] = BITSAVE_CONTRACT.split('.');
  
  const result = await callReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-contract-stats',
    functionArgs: [],
    senderAddress: contractAddress,
  });
  
  return cvToValue(result);
}

// ============================================
// BADGES CONTRACT - READ FUNCTIONS
// ============================================

export async function getBadgeOwner(tokenId: number) {
  const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
  
  const result = await callReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-owner',
    functionArgs: [uintCV(tokenId)],
    senderAddress: contractAddress,
  });
  
  return cvToValue(result);
}

export async function getBadgeMetadata(tokenId: number) {
  const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
  
  const result = await callReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-token-uri',
    functionArgs: [uintCV(tokenId)],
    senderAddress: contractAddress,
  });
  
  return cvToValue(result);
}

export async function getNextTokenId() {
  const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
  
  const result = await callReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-next-token-id',
    functionArgs: [],
    senderAddress: contractAddress,
  });
  
  return cvToValue(result);
}

// ============================================
// BADGES CONTRACT - WRITE FUNCTIONS
// ============================================

export async function transferBadge(tokenId: number, sender: string, recipient: string) {
  const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
  
  return openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs: [
      uintCV(tokenId),
      standardPrincipalCV(sender),
      standardPrincipalCV(recipient)
    ],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Badge transfer TX:', data.txId);
      return data;
    },
  });
}

export async function burnBadge(tokenId: number) {
  const [contractAddress, contractName] = BADGES_CONTRACT.split('.');
  
  return openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 'burn',
    functionArgs: [uintCV(tokenId)],
    postConditionMode: PostConditionMode.Deny,
    onFinish: (data) => {
      console.log('Badge burn TX:', data.txId);
      return data;
    },
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function microStxToStx(microStx: number): number {
  return microStx / 1000000;
}

export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1000000);
}

export function blocksToHours(blocks: number): number {
  return Math.floor(blocks / 6); // ~10 min per block
}

export function hoursToDays(hours: number): number {
  return Math.floor(hours / 24);
}

export function blocksToDays(blocks: number): number {
  return hoursToDays(blocksToHours(blocks));
}
