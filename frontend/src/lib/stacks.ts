import { 
  openContractCall, 
  showConnect, 
  UserSession, 
  AppConfig 
} from '@stacks/connect';
import { 
  uintCV, 
  standardPrincipalCV
} from '@stacks/transactions';
import { CONTRACTS } from './contracts';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'BitSave',
      icon: '/favicon.ico',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
};

export const disconnectWallet = () => {
  userSession.signUserOut('/');
};

export const depositSTX = async (amount: number, lockPeriod: number) => {
  return openContractCall({
    contractAddress: CONTRACTS.BITSAVE.split('.')[0],
    contractName: CONTRACTS.BITSAVE.split('.')[1],
    functionName: 'deposit',
    functionArgs: [uintCV(lockPeriod)],
    postConditionMode: 0x01,
    onFinish: (data) => {
      console.log('Transaction submitted:', data.txId);
    },
  });
};

export const withdrawSTX = async () => {
  return openContractCall({
    contractAddress: CONTRACTS.BITSAVE.split('.')[0],
    contractName: CONTRACTS.BITSAVE.split('.')[1],
    functionName: 'withdraw',
    functionArgs: [],
    postConditionMode: 0x01,
    onFinish: (data) => {
      console.log('Withdrawal submitted:', data.txId);
    },
  });
};

// Mock functions for now - will be replaced with actual API calls
export const getUserSavings = async (userAddress: string) => {
  // Mock data for development
  return {
    value: {
      amount: { value: 1000000000 }, // 1000 STX in microSTX
      'lock-period': { value: 4320 }, // 30 days in blocks
      'start-block': { value: 145000 },
      'maturity-block': { value: 149320 },
      'is-matured': { value: false }
    }
  };
};

export const getUserReputation = async (userAddress: string) => {
  // Mock data for development
  return {
    value: 750 // Mock reputation points
  };
};
