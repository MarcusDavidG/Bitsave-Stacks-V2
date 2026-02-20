import { callReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { CONTRACTS } from '../contracts';
import type { BadgeMetadata } from '@/types/contracts';

const network = new StacksTestnet();

export async function getBadgeOwner(tokenId: bigint): Promise<string | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.BADGES.split('.');
    const result = await callReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: 'get-owner',
      functionArgs: [],
    });
    return cvToValue(result) as string;
  } catch (error) {
    console.error('Failed to get badge owner:', error);
    return null;
  }
}

export async function getBadgeMetadata(tokenId: bigint): Promise<string | null> {
  try {
    const [contractAddress, contractName] = CONTRACTS.BADGES.split('.');
    const result = await callReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: 'get-token-uri',
      functionArgs: [],
    });
    return cvToValue(result) as string;
  } catch (error) {
    console.error('Failed to get badge metadata:', error);
    return null;
  }
}
