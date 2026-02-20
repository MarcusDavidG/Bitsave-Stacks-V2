#!/bin/bash
# BitSave Quick Deploy Script
# Run this to deploy to testnet

echo "🚀 BitSave Testnet Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
echo "📝 Step 2: Generating testnet deployment plan..."
clarinet deployments generate --testnet
echo "✅ Deployment plan generated!"
echo ""

# Step 3: Deploy
echo "🚀 Step 3: Deploying to testnet..."
echo "⚠️  This will open your Hiro wallet to sign transactions"
echo ""
read -p "Press Enter to continue..."
clarinet deployments apply --testnet

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "1. Copy your deployer address from the output above"
echo ""
echo "2. Update these files with your deployer address:"
echo "   - frontend/src/components/DepositForm.js"
echo "   - frontend/src/components/SavingsDisplay.js"
echo "   - frontend/src/components/ReputationDisplay.js"
echo ""
echo "   Change this line:"
echo "   const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'"
echo "   To:"
echo "   const CONTRACT_ADDRESS = 'YOUR_DEPLOYER_ADDRESS'"
echo ""
echo "3. Test the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 and test all features"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
