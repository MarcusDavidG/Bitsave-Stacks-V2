/**
 * Integration Test Script
 * Run this to verify contract integration is working
 */

import { 
  getSavings, 
  getReputation, 
  getRewardRate,
  getContractStats 
} from '../lib/bitsave-integration';

// Test address (replace with actual testnet address)
const TEST_ADDRESS = 'ST2QR5BT57BTVQM69ZFQBMW3BH7KDN3FX56H02TEW';

async function testIntegration() {
  console.log('🧪 Testing BitSave Integration...\n');

  try {
    // Test 1: Get Reward Rate
    console.log('1️⃣ Testing getRewardRate()...');
    const rewardRate = await getRewardRate();
    console.log('✅ Reward Rate:', rewardRate);
    console.log('');

    // Test 2: Get Contract Stats
    console.log('2️⃣ Testing getContractStats()...');
    const stats = await getContractStats();
    console.log('✅ Contract Stats:', stats);
    console.log('');

    // Test 3: Get User Savings
    console.log('3️⃣ Testing getSavings()...');
    const savings = await getSavings(TEST_ADDRESS);
    console.log('✅ User Savings:', savings);
    console.log('');

    // Test 4: Get User Reputation
    console.log('4️⃣ Testing getReputation()...');
    const reputation = await getReputation(TEST_ADDRESS);
    console.log('✅ User Reputation:', reputation);
    console.log('');

    console.log('✨ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testIntegration();
