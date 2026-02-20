'use client'

import { useState } from 'react'
import { openContractCall } from '@stacks/connect'
import { StacksTestnet } from '@stacks/network'
import { 
  uintCV, 
  PostConditionMode,
  makeStandardSTXPostCondition,
  FungibleConditionCode
} from '@stacks/transactions'

// UPDATE THESE WITH YOUR DEPLOYED CONTRACT ADDRESS
const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
const CONTRACT_NAME = 'bitsave'

export default function DepositForm({ userAddress }) {
  const [amount, setAmount] = useState('')
  const [lockDays, setLockDays] = useState('7')
  const [loading, setLoading] = useState(false)

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setLoading(true)

    try {
      const amountMicroSTX = Math.floor(parseFloat(amount) * 1000000)
      const lockPeriod = parseInt(lockDays) * 144 // blocks per day

      const postConditions = [
        makeStandardSTXPostCondition(
          userAddress,
          FungibleConditionCode.Equal,
          amountMicroSTX
        )
      ]

      await openContractCall({
        network: new StacksTestnet(),
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'deposit',
        functionArgs: [
          uintCV(amountMicroSTX),
          uintCV(lockPeriod)
        ],
        postConditions,
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data) => {
          console.log('Transaction:', data.txId)
          alert(`Deposit successful! TX: ${data.txId}`)
          setAmount('')
          setLoading(false)
        },
        onCancel: () => {
          setLoading(false)
        },
      })
    } catch (error) {
      console.error('Deposit error:', error)
      alert('Deposit failed: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Deposit STX</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm mb-2">Amount (STX)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-bitcoin"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-2">Lock Period (Days)</label>
          <select
            value={lockDays}
            onChange={(e) => setLockDays(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bitcoin"
            disabled={loading}
          >
            <option value="1">1 Day (Min)</option>
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="180">180 Days</option>
            <option value="365">365 Days</option>
          </select>
        </div>

        {amount && (
          <div className="bg-white/10 rounded-lg p-4 text-white text-sm">
            <div className="flex justify-between mb-2">
              <span>Deposit:</span>
              <span className="font-bold">{amount} STX</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Reward (10%):</span>
              <span className="font-bold text-green-400">
                {(parseFloat(amount) * 0.1).toFixed(2)} STX
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/20">
              <span>Total Return:</span>
              <span className="font-bold text-bitcoin">
                {(parseFloat(amount) * 1.1).toFixed(2)} STX
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={loading || !amount}
          className="w-full py-4 bg-gradient-to-r from-stacks to-purple-600 hover:from-purple-600 hover:to-stacks text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Deposit & Lock'}
        </button>
      </div>
    </div>
  )
}
