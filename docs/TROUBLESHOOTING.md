# BitSave Troubleshooting Guide

## Common Issues

### Contract Deployment

#### Issue: "Contract already exists"
**Solution:** Use a different contract name or redeploy to a fresh environment.

#### Issue: "Insufficient funds for deployment"
**Solution:** Ensure deployer wallet has enough STX for transaction fees.

### User Operations

#### Issue: "ERR-INVALID-AMOUNT"
**Cause:** Deposit amount below minimum threshold (1 STX)
**Solution:** Increase deposit amount to at least 1,000,000 microSTX

#### Issue: "ERR-INVALID-LOCK-PERIOD"
**Cause:** Lock period outside valid range (144-1051200 blocks)
**Solution:** Choose lock period between ~1 day and ~2 years

#### Issue: "ERR-STILL-LOCKED"
**Cause:** Attempting withdrawal before lock expiry
**Solution:** Wait until lock period expires or check `get-savings` for unlock time

#### Issue: "ERR-NO-SAVINGS"
**Cause:** User has no active savings to withdraw
**Solution:** Make a deposit first before attempting withdrawal

### Badge System

#### Issue: Badge not minted after withdrawal
**Cause:** Reputation points below threshold (1000 points)
**Solution:** Make larger deposits or longer lock periods to earn more reputation

#### Issue: "ERR-NOT-AUTHORIZED" when minting badges
**Cause:** Badge contract not authorized to mint
**Solution:** Run `set-authorized-minter` with BitSave contract address

### Frontend Issues

#### Issue: Wallet connection fails
**Solution:** 
1. Ensure Hiro Wallet extension is installed
2. Check network settings (testnet vs mainnet)
3. Refresh page and try again

#### Issue: Transaction not appearing
**Solution:**
1. Check transaction ID in Stacks explorer
2. Verify network connectivity
3. Wait for block confirmation

## Debug Commands

### Check Contract State
```bash
# Get user savings
clarinet call bitsave get-savings 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Check reputation
clarinet call bitsave get-reputation 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Verify reward rate
clarinet call bitsave get-reward-rate
```

### Test Badge System
```bash
# Check badge ownership
clarinet call bitsave-badges get-owner u1

# Verify authorized minter
clarinet call bitsave-badges get-authorized-minter
```
