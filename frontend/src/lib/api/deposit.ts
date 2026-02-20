import { openContractCall } from '@stacks/connect';
import { uintCV, stringUtf8CV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { CONTRACTS } from '../contracts';

const network = new StacksTestnet();

export async function deposit(amount: bigint, lockPeriod: bigint) {
  const [contractAddress, contractName] = CONTRACTS.BITSAVE.split('.');
  
  return openContractCall({
    network,
    contractAddress,
    contractName,
    functionName: 'deposit',
    functionArgs: [uintCV(amount), uintCV(lockPeriod)],
    onFinish: (data) => {
      console.log('Deposit transaction:', data.txId);
    },
  });
}

export async function depositWithGoal(
  amount: bigint,
  lockPeriod: bigint,
  goalAmount: bigint,
  goalDescription: string
) {
  const [contractAddress, contractName] = CONTRACTS.BITSAVE.split('.');
  
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
    onFinish: (data) => {
      console.log('Deposit with goal transaction:', data.txId);
    },
  });
}
