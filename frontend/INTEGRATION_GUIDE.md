# BitSave Frontend Integration Guide

Complete guide for integrating BitSave smart contracts with your Next.js frontend.

## 📦 Installation

The required packages are already installed:
- `@stacks/connect` - Wallet connection
- `@stacks/transactions` - Transaction building
- `@stacks/network` - Network configuration

## 🏗️ Architecture

### Core Files

1. **`/lib/bitsave-integration.ts`** - Main integration layer
   - All contract read/write functions
   - Utility functions for conversions

2. **`/hooks/useBitsaveContract.ts`** - React hooks for BitSave contract
   - `useSavingsData()` - Get user savings
   - `useReputationData()` - Get user reputation
   - `useDeposit()` - Make deposits
   - `useWithdraw()` - Withdraw funds

3. **`/hooks/useBadgesContract.ts`** - React hooks for Badges contract
   - `useBadgeOwner()` - Get badge owner
   - `useBadgeMetadata()` - Get badge metadata
   - `useTransferBadge()` - Transfer badges
   - `useBurnBadge()` - Burn badges

## 🚀 Quick Start

### 1. Connect Wallet

```tsx
import { connectWallet } from '@/lib/bitsave-integration';

<Button onClick={connectWallet}>
  Connect Wallet
</Button>
```

### 2. Read User Data

```tsx
import { useSavingsData, useReputationData } from '@/hooks/useBitsaveContract';

function MyComponent() {
  const { data: savings, loading } = useSavingsData(userAddress);
  const { data: reputation } = useReputationData(userAddress);

  return (
    <div>
      <p>Savings: {savings?.value?.amount?.value} microSTX</p>
      <p>Reputation: {reputation?.value} points</p>
    </div>
  );
}
```

### 3. Make a Deposit

```tsx
import { useDeposit } from '@/hooks/useBitsaveContract';
import { stxToMicroStx } from '@/lib/bitsave-integration';

function DepositComponent() {
  const { execute, loading, txId } = useDeposit();

  const handleDeposit = async () => {
    const amount = stxToMicroStx(100); // 100 STX
    const lockPeriod = 4320; // 30 days in blocks
    
    await execute(amount, lockPeriod);
  };

  return (
    <Button onClick={handleDeposit} disabled={loading}>
      {loading ? 'Processing...' : 'Deposit'}
    </Button>
  );
}
```

### 4. Withdraw Funds

```tsx
import { useWithdraw } from '@/hooks/useBitsaveContract';

function WithdrawComponent() {
  const { execute, loading, txId } = useWithdraw();

  return (
    <Button onClick={execute} disabled={loading}>
      {loading ? 'Processing...' : 'Withdraw'}
    </Button>
  );
}
```

## 📊 Data Structures

### Savings Data
```typescript
{
  value: {
    amount: { value: number },           // Amount in microSTX
    'lock-period': { value: number },    // Lock period in blocks
    'start-block': { value: number },    // Start block height
    'maturity-block': { value: number }, // Maturity block height
    'is-matured': { value: boolean }     // Maturity status
  }
}
```

### Reputation Data
```typescript
{
  value: number  // Reputation points
}
```

## 🛠️ Utility Functions

### Convert STX to microSTX
```typescript
import { stxToMicroStx } from '@/lib/bitsave-integration';

const microStx = stxToMicroStx(100); // 100000000
```

### Convert microSTX to STX
```typescript
import { microStxToStx } from '@/lib/bitsave-integration';

const stx = microStxToStx(100000000); // 100
```

### Convert blocks to days
```typescript
import { blocksToDays } from '@/lib/bitsave-integration';

const days = blocksToDays(4320); // 30
```

## 🎯 Common Patterns

### Check if savings are matured
```tsx
const { data: savings } = useSavingsData(userAddress);
const isMatured = savings?.value?.['is-matured']?.value;

if (isMatured) {
  // Show withdraw button
}
```

### Check badge eligibility
```tsx
const { data: reputation } = useReputationData(userAddress);
const canGetBadge = reputation?.value >= 1000;

if (canGetBadge) {
  // Show badge notification
}
```

### Handle transaction success
```tsx
const { execute, txId } = useDeposit();

const handleDeposit = async () => {
  await execute(amount, lockPeriod);
  
  if (txId) {
    // Show success message
    // Refetch user data
  }
};
```

## 🔐 Security Best Practices

1. **Always validate inputs** before calling contract functions
2. **Use PostConditionMode.Deny** for production (already configured)
3. **Check user authentication** before showing contract interactions
4. **Handle errors gracefully** with try-catch blocks
5. **Refetch data** after successful transactions

## 📱 Example Component

See `/components/dashboard-example.tsx` for a complete working example.

## 🧪 Testing

### Test on Testnet
1. Connect with Hiro Wallet (testnet mode)
2. Get testnet STX from faucet: https://explorer.hiro.so/sandbox/faucet
3. Test deposits with small amounts first
4. Verify transactions on explorer

### Contract Addresses
- BitSave: `ST2QR5BT57BTVQM69ZFQBMW3BH7KDN3FX56H02TEW.bitsave`
- Badges: `ST2QR5BT57BTVQM69ZFQBMW3BH7KDN3FX56H02TEW.bitsave-badges`

## 🐛 Troubleshooting

### "Contract not found"
- Verify contract addresses in `/lib/constants.ts`
- Ensure you're on the correct network (testnet/mainnet)

### "Insufficient balance"
- Check user has enough STX for transaction + fees
- Get testnet STX from faucet

### "Transaction failed"
- Check contract is not paused
- Verify lock period is within allowed range (144 - 525600 blocks)
- Ensure amount meets minimum deposit requirement

## 📚 Additional Resources

- [Stacks.js Documentation](https://docs.stacks.co/stacks.js)
- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Hiro Explorer](https://explorer.hiro.so)
