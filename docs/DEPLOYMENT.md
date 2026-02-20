# BitSave Deployment Guide

## Prerequisites
- Clarinet CLI installed
- Stacks wallet with STX for deployment
- Access to Stacks testnet/mainnet

## Local Development

### 1. Setup Environment
```bash
git clone https://github.com/MarcusDavidG/Bitsave-Stacks.git
cd Bitsave-Stacks
npm install
```

### 2. Run Tests
```bash
clarinet test
npm test
```

### 3. Local Console
```bash
clarinet console
```

## Testnet Deployment

### 1. Configure Network
Edit `Clarinet.toml`:
```toml
[network.testnet]
stacks_node_rpc_address = "https://stacks-node-api.testnet.stacks.co"
```

### 2. Deploy Contracts
```bash
# Deploy in order
clarinet deploy --network testnet contracts/bitsave-constants.clar
clarinet deploy --network testnet contracts/bitsave-events.clar  
clarinet deploy --network testnet contracts/bitsave-badges.clar
clarinet deploy --network testnet contracts/bitsave.clar
```

### 3. Initialize System
```bash
# Set badge minter authorization
clarinet call --network testnet bitsave-badges set-authorized-minter .bitsave
```

## Mainnet Deployment

### Security Checklist
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Multi-sig wallet configured
- [ ] Emergency procedures documented

### Deployment Steps
1. Deploy constants contract
2. Deploy events contract
3. Deploy badges contract
4. Deploy main bitsave contract
5. Configure badge authorization
6. Verify all functions work correctly
