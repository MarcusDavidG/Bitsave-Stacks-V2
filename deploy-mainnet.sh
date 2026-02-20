#!/bin/bash
# BitSave Mainnet Deployment Script
# Run this AFTER testing on testnet

echo "🚀 BitSave Mainnet Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  WARNING: You are about to deploy to MAINNET"
echo "⚠️  Make sure you have:"
echo "   - Tested thoroughly on testnet"
echo "   - Sufficient STX for deployment fees (~0.5 STX per contract)"
echo "   - Updated frontend with testnet contract addresses"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""

# Step 1: Verify contracts
echo "📋 Step 1: Verifying contracts..."
clarinet check
if [ $? -ne 0 ]; then
    echo "❌ Contract verification failed!"
    exit 1
fi
echo "✅ Contracts verified!"
echo ""

# Step 2: Generate deployment plan
echo "📝 Step 2: Generating mainnet deployment plan..."
clarinet deployments generate --mainnet
echo "✅ Deployment plan generated!"
echo ""

# Step 3: Deploy
echo "🚀 Step 3: Deploying to mainnet..."
echo "⚠️  This will open your Hiro wallet to sign transactions"
echo ""
read -p "Press Enter to continue..."
clarinet deployments apply --mainnet

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MAINNET DEPLOYMENT COMPLETE!"
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "1. Copy your mainnet deployer address from the output above"
echo ""
echo "2. Update frontend components with mainnet address"
echo ""
echo "3. Change network from StacksTestnet to StacksMainnet in:"
echo "   - frontend/src/components/DepositForm.js"
echo "   - frontend/src/components/SavingsDisplay.js"
echo "   - frontend/src/components/ReputationDisplay.js"
echo ""
echo "   Change:"
echo "   new StacksTestnet()"
echo "   To:"
echo "   new StacksMainnet()"
echo ""
echo "4. Build and deploy frontend:"
echo "   cd frontend"
echo "   npm run build"
echo "   vercel deploy --prod"
echo ""
echo "🎉 Your BitSave app is now LIVE on mainnet!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
