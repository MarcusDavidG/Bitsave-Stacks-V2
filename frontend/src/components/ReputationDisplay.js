'use client'

import { useState, useEffect } from 'react'
import { callReadOnlyFunction, cvToJSON } from '@stacks/transactions'
import { StacksTestnet } from '@stacks/network'

const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
const CONTRACT_NAME = 'bitsave'

export default function ReputationDisplay({ userAddress }) {
  const [reputation, setReputation] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReputation()
  }, [userAddress])

  const fetchReputation = async () => {
    try {
      const result = await callReadOnlyFunction({
        network: new StacksTestnet(),
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-reputation',
        functionArgs: [],
        senderAddress: userAddress,
      })

      const data = cvToJSON(result)
      setReputation(parseInt(data.value) / 1000000)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reputation:', error)
      setLoading(false)
    }
  }

  const getReputationLevel = (rep) => {
    if (rep >= 10000) return { level: 'Diamond', color: 'text-cyan-400', emoji: '💎' }
    if (rep >= 5000) return { level: 'Platinum', color: 'text-gray-300', emoji: '🏆' }
    if (rep >= 1000) return { level: 'Gold', color: 'text-yellow-400', emoji: '🥇' }
    if (rep >= 500) return { level: 'Silver', color: 'text-gray-400', emoji: '🥈' }
    if (rep >= 100) return { level: 'Bronze', color: 'text-orange-600', emoji: '🥉' }
    return { level: 'Beginner', color: 'text-white/70', emoji: '🌱' }
  }

  const level = getReputationLevel(reputation)
  const nextMilestone = reputation >= 10000 ? 10000 : 
                        reputation >= 5000 ? 10000 :
                        reputation >= 1000 ? 5000 :
                        reputation >= 500 ? 1000 :
                        reputation >= 100 ? 500 : 100
  const progress = (reputation / nextMilestone) * 100

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <p className="text-white/70">Loading reputation...</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Reputation</h2>
      
      <div className="text-center mb-6">
        <div className="text-6xl mb-2">{level.emoji}</div>
        <p className={`text-2xl font-bold ${level.color}`}>{level.level}</p>
        <p className="text-4xl font-bold text-white mt-2">{reputation.toFixed(0)}</p>
        <p className="text-white/70 text-sm">Reputation Points</p>
      </div>

      {reputation < 10000 && (
        <div>
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>Progress to {nextMilestone}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-bitcoin to-orange-600 h-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2 text-sm text-white/80">
        <p className="font-bold">Milestones:</p>
        <div className="space-y-1">
          <p className={reputation >= 100 ? 'text-orange-600' : 'text-white/50'}>
            🥉 Bronze: 100 points
          </p>
          <p className={reputation >= 500 ? 'text-gray-400' : 'text-white/50'}>
            🥈 Silver: 500 points
          </p>
          <p className={reputation >= 1000 ? 'text-yellow-400' : 'text-white/50'}>
            🥇 Gold: 1,000 points (Badge Unlocked!)
          </p>
          <p className={reputation >= 5000 ? 'text-gray-300' : 'text-white/50'}>
            🏆 Platinum: 5,000 points
          </p>
          <p className={reputation >= 10000 ? 'text-cyan-400' : 'text-white/50'}>
            💎 Diamond: 10,000 points
          </p>
        </div>
      </div>
    </div>
  )
}
