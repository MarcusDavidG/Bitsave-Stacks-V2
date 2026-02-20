#!/bin/bash

# BitSave Mainnet Deployment Script
# This script deploys BitSave contracts to Stacks mainnet

set -e

echo "🚀 Starting BitSave Mainnet Deployment..."

# Check if clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo "❌ Clarinet not found. Please install clarinet first."
    exit 1
fi

# Check if mainnet configuration exists
if [ ! -f "settings/Mainnet.toml" ]; then
    echo "❌ Mainnet configuration not found. Please set up settings/Mainnet.toml"
    exit 1
fi

# Validate contracts
echo "📋 Validating contracts..."
clarinet check

# Run comprehensive tests
echo "🧪 Running comprehensive test suite..."
npm test

# Security check
echo "🔒 Running security checks..."
echo "⚠️  Please ensure you have completed a security audit before mainnet deployment"
read -p "Have you completed a security audit? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please complete security audit before mainnet deployment"
    exit 1
fi

# Final confirmation
echo "⚠️  WARNING: This will deploy to MAINNET with real STX tokens"
read -p "Are you sure you want to deploy to mainnet? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy to mainnet
echo "🌐 Deploying to mainnet..."
clarinet deployments apply --mainnet

# Set up badge minting authorization
echo "🏆 Setting up badge system..."
if [ -f "deployments/set-minter.mainnet-plan.yaml" ]; then
    clarinet deployments apply -p deployments/set-minter.mainnet-plan.yaml --mainnet
fi

echo "✅ Mainnet deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Verify contracts on mainnet explorer"
echo "2. Update frontend with mainnet contract addresses"
echo "3. Monitor contract performance"
echo "4. Announce launch to community"
echo ""
echo "🔗 Mainnet Explorer: https://explorer.hiro.so/?chain=mainnet"
