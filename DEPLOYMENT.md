# BitSave Deployment Guide

## Prerequisites
1. Install Clarinet: `npm install -g @hirosystems/clarinet`
2. Create a Hiro wallet at https://wallet.hiro.so
3. Get testnet STX from faucet: https://explorer.hiro.so/sandbox/faucet

## Deploy to Testnet

### Step 1: Generate Deployment Plan
```bash
clarinet deployments generate --testnet
```

### Step 2: Deploy Contracts
```bash
clarinet deployments apply --testnet
```

This will:
- Deploy `bitsave.clar` contract
- Deploy `bitsave-badges.clar` contract
- Prompt you to sign transactions with your wallet

### Step 3: Authorize Badge Minting
After deployment, authorize the main contract to mint badges via Hiro Platform.

## Deploy to Mainnet

### Step 1: Generate Mainnet Deployment Plan
```bash
clarinet deployments generate --mainnet
```

### Step 2: Deploy to Mainnet
```bash
clarinet deployments apply --mainnet
```

## Verify Deployment
- Testnet: https://explorer.hiro.so/txid/<transaction-id>?chain=testnet
- Mainnet: https://explorer.hiro.so/txid/<transaction-id>?chain=mainnet
