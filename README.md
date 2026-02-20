# BitSave – Bitcoin-Powered STX Savings Vault

**Author:** Marcus David  
**Purpose:** A decentralized savings vault on Stacks where users lock STX for a period and earn rewards and on-chain reputation points.

---

## Overview

**BitSave** is a production-ready, decentralized savings protocol built on the **Stacks blockchain**.  
Users **lock STX tokens** for a chosen duration, **earn 10% rewards**, and build **on-chain reputation**.

---

## Features
- Deposit STX and lock for chosen duration (min 1 day)
- Earn 10% rewards on locked amount
- Withdraw after lock expiry with rewards
- Build on-chain reputation with every withdrawal
- Emergency withdraw option (forfeit rewards)
- NFT badge system for achievements
- Production-ready frontend with wallet integration

---

## Quick Start

### 1. Deploy Smart Contracts

```bash
# Check contracts are valid
clarinet check

# Deploy to testnet
clarinet deployments generate --testnet
clarinet deployments apply --testnet

# Deploy to mainnet
clarinet deployments generate --mainnet
clarinet deployments apply --mainnet
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### 2. Setup Frontend

```bash
cd frontend
npm install

# Update contract addresses in:
# - src/components/DepositForm.js
# - src/components/SavingsDisplay.js  
# - src/components/ReputationDisplay.js

npm run dev
```

Frontend runs at http://localhost:3000

### 3. Build for Production

```bash
cd frontend
npm run build
npm start
```

---

## Smart Contract Functions

### BitSave Contract (`bitsave.clar`)

| Function | Type | Description |
|-----------|------|--------------|
| `deposit(amount, lock-period)` | public | Locks STX for specified blocks |
| `withdraw()` | public | Withdraws funds + rewards after maturity |
| `emergency-withdraw()` | public | Withdraws principal only (no rewards) |
| `set-reward-rate(new-rate)` | admin | Updates reward rate |
| `get-savings(user)` | read-only | Returns user's savings info |
| `get-reputation(user)` | read-only | Returns reputation score |
| `get-reward-rate()` | read-only | Returns current rate |
| `calculate-reward(amount)` | read-only | Calculates reward for amount |
| `get-total-return(user)` | read-only | Returns total with rewards |

### BitSave Badges Contract (`bitsave-badges.clar`)

| Function | Type | Description |
|-----------|------|--------------|
| `set-authorized-minter(minter)` | admin | Authorizes contract to mint |
| `mint(recipient, name, tier, threshold)` | authorized | Mints badge to recipient |
| `transfer(token-id, sender, recipient)` | public | Transfers badge |
| `burn(token-id)` | public | Burns badge |
| `get-owner(token-id)` | read-only | Returns badge owner |
| `get-metadata(token-id)` | read-only | Returns badge metadata |
| `get-token-uri(token-id)` | read-only | Returns token URI |

---

## Frontend Features

- **Wallet Integration**: Connect with Hiro, Leather, or Xverse wallet
- **Deposit Interface**: Choose amount and lock period with reward preview
- **Savings Dashboard**: View locked amount, rewards, and unlock status
- **Reputation System**: Track reputation points with visual levels
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Auto-refresh savings and reputation data

---

## Project Structure

```
Bitsave-Stacks-V2/
│
├── contracts/
│   ├── bitsave.clar              # Main savings vault contract
│   └── bitsave-badges.clar       # NFT badge system
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js
│   │   │   ├── page.js
│   │   │   └── globals.css
│   │   └── components/
│   │       ├── WalletConnect.js
│   │       ├── DepositForm.js
│   │       ├── SavingsDisplay.js
│   │       └── ReputationDisplay.js
│   ├── package.json
│   └── README.md
│
├── Clarinet.toml
├── DEPLOYMENT.md
└── README.md
```

---

## Deployment Checklist

- [ ] Contracts validated with `clarinet check`
- [ ] Deployed to testnet
- [ ] Tested deposit/withdraw on testnet
- [ ] Authorized badge minting
- [ ] Deployed to mainnet
- [ ] Updated frontend with contract addresses
- [ ] Frontend tested with real wallet
- [ ] Production build created
- [ ] Deployed to hosting platform

---

## Technology Stack

**Smart Contracts:**
- Clarity (Stacks blockchain)
- Clarinet (development & testing)

**Frontend:**
- Next.js 15
- React 19
- Tailwind CSS
- @stacks/connect (wallet integration)
- @stacks/transactions (contract calls)

---

## Security Features

- Post-conditions on all transfers
- Owner-only admin functions
- Lock period enforcement
- Emergency withdraw option
- Input validation

---

## Future Enhancements

- Multiple badge tiers (Bronze, Silver, Gold, Platinum, Diamond)
- Time-based streak badges
- Badge marketplace
- DAO governance for reward rates
- sBTC integration
- Compound interest options

---

## License

Open source - Educational purposes

---

## Support

For issues or questions:
- Check [DEPLOYMENT.md](DEPLOYMENT.md)
- Check [frontend/README.md](frontend/README.md)
- Review contract code in `contracts/`

---

**Built on Stacks • Secured by Bitcoin**
