import { callReadOnlyFunction, cvToValue, standardPrincipalCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { BITSAVE_CONTRACT } from '../constants';

const network = new StacksTestnet();

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
