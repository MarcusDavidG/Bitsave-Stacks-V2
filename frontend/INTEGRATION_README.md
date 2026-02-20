# 🔗 BitSave Smart Contract Integration

Complete integration between BitSave smart contracts and Next.js frontend.

## ✅ What's Included

### Core Integration Files

1. **`/lib/bitsave-integration.ts`**
   - Complete contract interaction layer
   - All read/write functions for both contracts
   - Utility functions for conversions
   - Wallet connection helpers

2. **`/hooks/useBitsaveContract.ts`**
   - React hooks for BitSave contract
   - Auto-refreshing data hooks
   - Transaction state management
   - Error handling

3. **`/hooks/useBadgesContract.ts`**
   - React hooks for Badges contract
   - NFT badge operations
   - Transfer and burn functionality

4. **`/components/dashboard-example.tsx`**
   - Complete working example
   - Shows all integration patterns
   - Ready to use or customize

5. **`INTEGRATION_GUIDE.md`**
   - Detailed documentation
   - Code examples
   - Best practices
   - Troubleshooting

## 🚀 Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Update Contract Addresses
Edit `/lib/constants.ts` with your deployed contract addresses:
```typescript
export const CONTRACT_ADDRESS = "YOUR_ADDRESS_HERE";
```

### 3. Use in Your Components

**Connect Wallet:**
```tsx
import { connectWallet } from '@/lib/bitsave-integration';

<Button onClick={connectWallet}>Connect</Button>
```

**Read Data:**
```tsx
import { useSavingsData } from '@/hooks/useBitsaveContract';

const { data, loading } = useSavingsData(userAddress);
```

**Make Deposit:**
```tsx
import { useDeposit } from '@/hooks/useBitsaveContract';

const { execute, loading } = useDeposit();
await execute(1000000, 4320); // 1 STX, 30 days
```

## 📋 Available Functions

### BitSave Contract

**Read Functions:**
- `getSavings(userAddress)` - Get user's savings info
- `getReputation(userAddress)` - Get reputation points
- `getRewardRate()` - Get current reward rate
- `getContractStats()` - Get contract statistics

**Write Functions:**
- `deposit(amount, lockPeriod)` - Lock STX
- `depositWithGoal(amount, lockPeriod, goalAmount, description)` - Deposit with goal
- `withdraw()` - Withdraw matured savings

### Badges Contract

**Read Functions:**
- `getBadgeOwner(tokenId)` - Get badge owner
- `getBadgeMetadata(tokenId)` - Get badge metadata
- `getNextTokenId()` - Get next token ID

**Write Functions:**
- `transferBadge(tokenId, sender, recipient)` - Transfer badge
- `burnBadge(tokenId)` - Burn badge

## 🎣 React Hooks

### Read Hooks
- `useSavingsData(userAddress)` - Auto-refreshing savings data
- `useReputationData(userAddress)` - Auto-refreshing reputation
- `useRewardRateData()` - Current reward rate
- `useContractStatsData()` - Contract statistics
- `useBadgeOwner(tokenId)` - Badge owner info
- `useBadgeMetadata(tokenId)` - Badge metadata

### Write Hooks
- `useDeposit()` - Make deposits
- `useDepositWithGoal()` - Deposit with savings goal
- `useWithdraw()` - Withdraw funds
- `useTransferBadge()` - Transfer badges
- `useBurnBadge()` - Burn badges

## 🛠️ Utility Functions

```typescript
// Conversions
stxToMicroStx(100)        // 100 STX → 100000000 microSTX
microStxToStx(100000000)  // 100000000 microSTX → 100 STX
blocksToDays(4320)        // 4320 blocks → 30 days
blocksToHours(144)        // 144 blocks → 24 hours
```

## 📊 Data Structures

### Savings Response
```typescript
{
  value: {
    amount: { value: 100000000 },        // microSTX
    'lock-period': { value: 4320 },      // blocks
    'start-block': { value: 145000 },
    'maturity-block': { value: 149320 },
    'is-matured': { value: false }
  }
}
```

### Reputation Response
```typescript
{
  value: 750  // reputation points
}
```

## 🎯 Usage Examples

### Complete Deposit Flow
```tsx
function DepositFlow() {
  const [amount, setAmount] = useState('');
  const { execute, loading, txId } = useDeposit();
  const { refetch } = useSavingsData(userAddress);

  const handleDeposit = async () => {
    const microStx = stxToMicroStx(parseFloat(amount));
    const lockPeriod = 4320; // 30 days
    
    await execute(microStx, lockPeriod);
    
    // Refetch after transaction
    setTimeout(() => refetch(), 3000);
  };

  return (
    <div>
      <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
      <Button onClick={handleDeposit} disabled={loading}>
        {loading ? 'Processing...' : 'Deposit'}
      </Button>
      {txId && <p>TX: {txId}</p>}
    </div>
  );
}
```

### Display User Stats
```tsx
function UserStats({ userAddress }) {
  const { data: savings } = useSavingsData(userAddress);
  const { data: reputation } = useReputationData(userAddress);

  return (
    <div>
      <h2>Your Stats</h2>
      <p>Savings: {microStxToStx(savings?.value?.amount?.value || 0)} STX</p>
      <p>Reputation: {reputation?.value || 0} points</p>
      <p>Lock Period: {blocksToDays(savings?.value?.['lock-period']?.value || 0)} days</p>
      {savings?.value?.['is-matured']?.value && <Badge>Matured ✅</Badge>}
    </div>
  );
}
```

### Withdraw with Validation
```tsx
function WithdrawButton({ userAddress }) {
  const { data: savings } = useSavingsData(userAddress);
  const { execute, loading } = useWithdraw();
  
  const canWithdraw = savings?.value?.['is-matured']?.value;

  return (
    <Button 
      onClick={execute} 
      disabled={!canWithdraw || loading}
    >
      {loading ? 'Processing...' : 'Withdraw'}
    </Button>
  );
}
```

## 🧪 Testing

### Run Integration Test
```bash
cd frontend/src
npx tsx test-integration.ts
```

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to dashboard example
3. Connect wallet (testnet)
4. Test deposit/withdraw flows

## 🔐 Security Notes

- All write functions use `PostConditionMode.Deny` for safety
- Input validation should be done before calling contract functions
- Always check user authentication before showing contract interactions
- Handle errors gracefully with try-catch blocks

## 📚 Documentation

- **Full Guide:** See `INTEGRATION_GUIDE.md`
- **Example Component:** See `components/dashboard-example.tsx`
- **Contract Docs:** See main `README.md`

## 🐛 Common Issues

**"Contract not found"**
- Check contract addresses in `/lib/constants.ts`
- Verify network (testnet vs mainnet)

**"Insufficient balance"**
- Get testnet STX from faucet
- Check transaction fees

**"Transaction failed"**
- Verify lock period is valid (144-525600 blocks)
- Check contract is not paused
- Ensure minimum deposit met

## 🎉 Next Steps

1. ✅ Integration files created
2. ✅ React hooks ready
3. ✅ Example component provided
4. ⏭️ Customize UI components
5. ⏭️ Add error handling
6. ⏭️ Implement loading states
7. ⏭️ Add transaction notifications
8. ⏭️ Deploy to production

## 📞 Support

For issues or questions:
- Check `INTEGRATION_GUIDE.md`
- Review example component
- Test with small amounts first
- Use testnet before mainnet

---

**Ready to integrate!** 🚀 Start with the example component and customize from there.
