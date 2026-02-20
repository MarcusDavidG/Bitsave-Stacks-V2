'use client'

import { useState, useEffect } from 'react'
import { openContractCall } from '@stacks/connect'
import { StacksTestnet } from '@stacks/network'
import { callReadOnlyFunction, cvToJSON, PostConditionMode } from '@stacks/transactions'

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
const CONTRACT_NAME = 'bitsave'

export default function SavingsDisplay({ userAddress }) {
  const [savings, setSavings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    fetchSavings()
    const interval = setInterval(fetchSavings, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [userAddress])

  const fetchSavings = async () => {
    try {
      const result = await callReadOnlyFunction({
        network: new StacksTestnet(),
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-savings',
        functionArgs: [],
        senderAddress: userAddress,
      })

      const data = cvToJSON(result)
      if (data.value) {
        setSavings({
          amount: parseInt(data.value.amount.value) / 1000000,
          lockUntil: parseInt(data.value['lock-until'].value),
          depositedAt: parseInt(data.value['deposited-at'].value)
        })
      } else {
        setSavings(null)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching savings:', error)
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    setWithdrawing(true)
    try {
      await openContractCall({
        network: new StacksTestnet(),
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'withdraw',
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          alert(`Withdrawal successful! TX: ${data.txId}`)
          fetchSavings()
          setWithdrawing(false)
        },
        onCancel: () => {
          setWithdrawing(false)
        },
      })
    } catch (error) {
      alert('Withdrawal failed: ' + error.message)
      setWithdrawing(false)
    }
  }

  const handleEmergencyWithdraw = async () => {
    if (!confirm('Emergency withdraw will forfeit your rewards. Continue?')) return
    
    setWithdrawing(true)
    try {
      await openContractCall({
        network: new StacksTestnet(),
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'emergency-withdraw',
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          alert(`Emergency withdrawal successful! TX: ${data.txId}`)
          fetchSavings()
          setWithdrawing(false)
        },
        onCancel: () => {
          setWithdrawing(false)
        },
      })
    } catch (error) {
      alert('Emergency withdrawal failed: ' + error.message)
      setWithdrawing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <p className="text-white/70">Loading savings...</p>
      </div>
    )
  }

  if (!savings) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Your Savings</h2>
        <p className="text-white/70">No active savings. Make a deposit to get started!</p>
      </div>
    )
  }

  const reward = savings.amount * 0.1
  const total = savings.amount + reward
  const isUnlocked = Date.now() > savings.lockUntil * 1000

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Your Savings</h2>
      
      <div className="space-y-4">
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white/70 text-sm mb-1">Locked Amount</p>
          <p className="text-3xl font-bold text-white">{savings.amount.toFixed(2)} STX</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-sm mb-1">Reward</p>
            <p className="text-xl font-bold text-green-400">+{reward.toFixed(2)} STX</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-sm mb-1">Total Return</p>
            <p className="text-xl font-bold text-bitcoin">{total.toFixed(2)} STX</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white/70 text-sm mb-2">Status</p>
          {isUnlocked ? (
            <p className="text-green-400 font-bold">✓ Unlocked - Ready to withdraw!</p>
          ) : (
            <p className="text-yellow-400 font-bold">🔒 Locked until block {savings.lockUntil}</p>
          )}
        </div>

        <button
          onClick={handleWithdraw}
          disabled={!isUnlocked || withdrawing}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {withdrawing ? 'Processing...' : 'Withdraw'}
        </button>

        <button
          onClick={handleEmergencyWithdraw}
          disabled={withdrawing}
          className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded-lg transition"
        >
          Emergency Withdraw (No Rewards)
        </button>
      </div>
    </div>
  )
}
