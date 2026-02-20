'use client'

import { useState, useEffect } from 'react'
import WalletConnect from '@/components/WalletConnect'
import DepositForm from '@/components/DepositForm'
import SavingsDisplay from '@/components/SavingsDisplay'
import ReputationDisplay from '@/components/ReputationDisplay'

export default function Home() {
  const [userAddress, setUserAddress] = useState(null)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            ₿ BitSave
          </h1>
          <p className="text-xl text-white/90">
            Bitcoin-Powered STX Savings Vault
          </p>
          <p className="text-white/70 mt-2">
            Lock STX • Earn Rewards • Build Reputation
          </p>
        </header>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletConnect 
            userAddress={userAddress} 
            setUserAddress={setUserAddress} 
          />
        </div>

        {userAddress ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Deposit & Savings */}
            <div className="space-y-6">
              <DepositForm userAddress={userAddress} />
              <SavingsDisplay userAddress={userAddress} />
            </div>

            {/* Right Column - Reputation & Stats */}
            <div className="space-y-6">
              <ReputationDisplay userAddress={userAddress} />
              
              {/* Info Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">How It Works</h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span>
                    <span>Deposit STX and choose your lock period (min 1 day)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span>
                    <span>Earn 10% rewards on your locked amount</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span>
                    <span>Withdraw after maturity to claim rewards + reputation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">4.</span>
                    <span>Earn NFT badges at reputation milestones</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-white/80 py-20">
            <p className="text-xl">Connect your wallet to get started</p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-white/60 mt-16 text-sm">
          <p>Built on Stacks • Secured by Bitcoin</p>
        </footer>
      </div>
    </main>
  )
}
