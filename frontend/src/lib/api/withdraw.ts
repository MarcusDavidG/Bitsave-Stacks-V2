import { openContractCall } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { CONTRACTS } from '../contracts';

const network = new StacksTestnet();

export async function withdraw() {
  const [contractAddress, contractName] = CONTRACTS.BITSAVE.split('.');
  
  return openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 'withdraw',
    functionArgs: [],
    onFinish: (data) => {
      console.log('Withdrawal transaction:', data.txId);
    },
  });
}
