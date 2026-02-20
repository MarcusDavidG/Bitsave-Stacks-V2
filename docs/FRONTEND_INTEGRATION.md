# BitSave Frontend Integration Guide

## Overview
This guide covers integrating the BitSave protocol with frontend applications using the Stacks.js library.

## Installation

```bash
npm install @stacks/connect @stacks/transactions @stacks/network
```

## Basic Setup

### 1. Initialize Stacks Connection
```typescript
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksTestnet(); // or StacksMainnet()
```

### 2. Connect Wallet
```typescript
const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'BitSave',
      icon: '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
};
```

## Contract Interactions

### Deposit STX
```typescript
import { contractPrincipalCV, uintCV } from '@stacks/transactions';

const depositSTX = async (amount: number, lockPeriod: number) => {
  const txOptions = {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'bitsave',
    functionName: 'deposit',
    functionArgs: [uintCV(lockPeriod)],
    senderKey: userSession.loadUserData().profile.stxAddress.testnet,
    network,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};
```

### Withdraw STX
```typescript
const withdrawSTX = async () => {
  const txOptions = {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'bitsave',
    functionName: 'withdraw',
    functionArgs: [],
    senderKey: userSession.loadUserData().profile.stxAddress.testnet,
    network,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  return broadcastTransaction(transaction, network);
};
```

### Read User Data
```typescript
const getUserSavings = async (userAddress: string) => {
  const options = {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'bitsave',
    functionName: 'get-savings',
    functionArgs: [standardPrincipalCV(userAddress)],
    network,
    senderAddress: userAddress,
  };

  return callReadOnlyFunction(options);
};
```

## Error Handling

```typescript
const handleContractError = (error: any) => {
  switch (error.error) {
    case 'u101':
      return 'Invalid deposit amount. Minimum 1 STX required.';
    case 'u102':
      return 'Invalid lock period. Must be between 1 day and 2 years.';
    case 'u103':
      return 'No savings found for this address.';
    case 'u104':
      return 'Funds are still locked. Please wait until maturity.';
    default:
      return 'Transaction failed. Please try again.';
  }
};
```
