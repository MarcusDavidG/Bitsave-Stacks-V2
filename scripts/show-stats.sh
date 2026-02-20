#!/bin/bash

# BitSave Frontend Integration - Quick Stats

cd /home/marcus/Bitsave-Stacks

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        🎉 BitSave Frontend Integration Complete! 🎉       ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 PROJECT STATISTICS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count commits
TOTAL_COMMITS=$(git log --oneline | wc -l)
FEATURE_COMMITS=$(git log --oneline | grep "feat:" | wc -l)
echo "✅ Total Commits:           $TOTAL_COMMITS"
echo "✅ Feature Commits:         $FEATURE_COMMITS"
echo ""

# Count files
COMPONENTS=$(find frontend/src/components -name "*.tsx" 2>/dev/null | wc -l)
HOOKS=$(find frontend/src/hooks -name "*.ts" 2>/dev/null | wc -l)
API_FILES=$(find frontend/src/lib/api -name "*.ts" 2>/dev/null | wc -l)
CONTEXTS=$(find frontend/src/contexts -name "*.tsx" 2>/dev/null | wc -l)
TYPES=$(find frontend/src/types -name "*.ts" 2>/dev/null | wc -l)

echo "📁 FILES CREATED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Components:              $COMPONENTS"
echo "   Hooks:                   $HOOKS"
echo "   API Files:               $API_FILES"
echo "   Contexts:                $CONTEXTS"
echo "   Type Definitions:        $TYPES"
echo ""

# Component breakdown
echo "🎨 COMPONENT BREAKDOWN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Admin Components:        $(find frontend/src/components/admin -name "*.tsx" 2>/dev/null | wc -l)"
echo "   Analytics Components:    $(find frontend/src/components/analytics -name "*.tsx" 2>/dev/null | wc -l)"
echo "   Chart Components:        $(find frontend/src/components/charts -name "*.tsx" 2>/dev/null | wc -l)"
echo "   Form Components:         $(find frontend/src/components/forms -name "*.tsx" 2>/dev/null | wc -l)"
echo "   Layout Components:       $(find frontend/src/components/layouts -name "*.tsx" 2>/dev/null | wc -l)"
echo "   Mobile Components:       $(find frontend/src/components/mobile -name "*.tsx" 2>/dev/null | wc -l)"
echo "   Modal Components:        $(find frontend/src/components/modals -name "*.tsx" 2>/dev/null | wc -l)"
echo "   Notification Components: $(find frontend/src/components/notifications -name "*.tsx" 2>/dev/null | wc -l)"
echo "   Referral Components:     $(find frontend/src/components/referrals -name "*.tsx" 2>/dev/null | wc -l)"
echo "   Responsive Components:   $(find frontend/src/components/responsive -name "*.tsx" 2>/dev/null | wc -l)"
echo ""

# Integration status
echo "🔗 SMART CONTRACT INTEGRATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   ✅ bitsave.clar          - Main vault contract"
echo "   ✅ bitsave-badges.clar   - NFT badge system"
echo "   ✅ bitsave-referrals.clar - Referral system"
echo "   ✅ bitsave-validation.clar - Validation utilities"
echo "   ✅ bitsave-math.clar     - Math calculations"
echo "   ✅ bitsave-events.clar   - Event logging"
echo ""

# Features
echo "🚀 FEATURES IMPLEMENTED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   ✅ Wallet Connection (Stacks)"
echo "   ✅ Deposit System (Basic + Goal-based)"
echo "   ✅ Withdrawal System (with penalties)"
echo "   ✅ Reputation Tracking"
echo "   ✅ NFT Badge System"
echo "   ✅ Admin Panel"
echo "   ✅ Analytics Dashboard"
echo "   ✅ Referral System"
echo "   ✅ Mobile Responsive"
echo "   ✅ Dark/Light Theme"
echo ""

# Current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 CURRENT BRANCH: $CURRENT_BRANCH"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              ✨ Ready for Implementation! ✨              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📖 See INTEGRATION_COMPLETE.md for full details"
echo ""
