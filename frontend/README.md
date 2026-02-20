# BitSave Frontend

Production-ready frontend for BitSave - Bitcoin-Powered STX Savings Vault

## Features

- ✅ Wallet connection (Hiro/Leather wallet)
- ✅ Deposit STX with customizable lock periods
- ✅ Real-time savings display with countdown
- ✅ Withdraw functionality (normal + emergency)
- ✅ Reputation tracking with visual levels
- ✅ Responsive design with Tailwind CSS
- ✅ Beautiful gradient UI

## Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Update Contract Addresses
Edit the following files and replace `CONTRACT_ADDRESS` with your deployed contract address:

- `src/components/DepositForm.js`
- `src/components/SavingsDisplay.js`
- `src/components/ReputationDisplay.js`

```javascript
const CONTRACT_ADDRESS = 'YOUR_DEPLOYER_ADDRESS'
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production
```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms
```bash
npm run build
# Deploy the .next folder
```

## Network Configuration

Currently configured for **Stacks Testnet**.

To switch to mainnet, update all instances of:
```javascript
new StacksTestnet()
```

to:
```javascript
new StacksMainnet()
```

## Wallet Integration

The app uses `@stacks/connect` for wallet integration, supporting:
- Hiro Wallet
- Leather Wallet
- Xverse Wallet

## Components

- **WalletConnect**: Handles wallet connection/disconnection
- **DepositForm**: Deposit STX with lock period selection
- **SavingsDisplay**: Shows active savings and withdrawal options
- **ReputationDisplay**: Displays reputation points and levels

## Customization

### Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  bitcoin: '#f7931a',
  stacks: '#5546ff',
}
```

### Styling
Global styles in `src/app/globals.css`

## Troubleshooting

### Wallet not connecting
- Ensure you have Hiro or Leather wallet installed
- Check browser console for errors
- Try refreshing the page

### Transactions failing
- Verify contract addresses are correct
- Ensure you have enough STX for gas fees
- Check network (testnet vs mainnet)

### Data not loading
- Verify contract is deployed
- Check network connection
- Open browser console for error details
