# BitSave MVP - Deployment Instructions

## ✅ What's Been Done

1. **Cleaned up project** - Removed old frontend and docs
2. **Created streamlined smart contracts**:
   - `bitsave.clar` - Core savings vault (deposit, withdraw, reputation)
   - `bitsave-badges.clar` - NFT achievement system
3. **Built production-ready frontend** with Next.js + Tailwind
4. **Committed and pushed** all changes to GitHub

## 🚀 Next Steps: Deploy to Hiro Platform

### Step 1: Deploy Contracts to Testnet

```bash
cd /home/marcus/Bitsave-Stacks-V2

# Generate testnet deployment plan
clarinet deployments generate --testnet

# Deploy to testnet (will open Hiro wallet)
clarinet deployments apply --testnet
```

This will:
- Deploy both contracts to Stacks testnet
- Prompt you to sign transactions with your Hiro wallet
- Give you contract addresses like: `ST1ABC...XYZ.bitsave`

### Step 2: Update Frontend with Contract Addresses

After deployment, update these 3 files with your deployer address:

1. `frontend/src/components/DepositForm.js`
2. `frontend/src/components/SavingsDisplay.js`
3. `frontend/src/components/ReputationDisplay.js`

Change this line in each file:
```javascript
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
```

To your actual deployer address (shown after deployment).

### Step 3: Test Frontend Locally

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 and test:
- Connect wallet
- Make a deposit
- View savings
- Check reputation

### Step 4: Deploy to Mainnet (When Ready)

```bash
# Generate mainnet deployment plan
clarinet deployments generate --mainnet

# Deploy to mainnet
clarinet deployments apply --mainnet
```

### Step 5: Deploy Frontend to Production

**Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

**Option B: Build and host anywhere**
```bash
cd frontend
npm run build
npm start
```

## 📋 Verification Checklist

- [ ] Contracts deployed to testnet
- [ ] Contract addresses updated in frontend
- [ ] Wallet connection works
- [ ] Can deposit STX
- [ ] Can view savings
- [ ] Can withdraw after lock period
- [ ] Reputation updates correctly
- [ ] Contracts deployed to mainnet
- [ ] Frontend deployed to production

## 🔗 Useful Links

- **Hiro Platform**: https://platform.hiro.so
- **Testnet Explorer**: https://explorer.hiro.so/?chain=testnet
- **Mainnet Explorer**: https://explorer.hiro.so/?chain=mainnet
- **Testnet Faucet**: https://explorer.hiro.so/sandbox/faucet

## 📝 Contract Interaction on Hiro Platform

After deployment, you can interact with your contracts directly on Hiro Platform:

1. Go to https://platform.hiro.so
2. Connect your wallet
3. Find your deployed contracts
4. Call functions directly from the UI
5. View transaction history

## 🎯 Key Features Implemented

✅ Deposit STX with customizable lock periods (1-365 days)
✅ 10% reward calculation
✅ Withdraw after maturity
✅ Emergency withdraw (forfeit rewards)
✅ Reputation tracking
✅ NFT badge system
✅ Beautiful responsive UI
✅ Real-time data updates
✅ Wallet integration (Hiro/Leather/Xverse)

## 🔧 Troubleshooting

**Issue**: Clarinet command not found
**Solution**: `npm install -g @hirosystems/clarinet`

**Issue**: Wallet not connecting
**Solution**: Install Hiro or Leather wallet extension

**Issue**: Transaction failing
**Solution**: Ensure you have testnet STX from faucet

**Issue**: Frontend not loading data
**Solution**: Verify contract addresses are correct in components

---

**You're ready to deploy! 🚀**
