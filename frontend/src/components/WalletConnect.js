'use client'

import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { useState, useEffect } from 'react'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

export default function WalletConnect({ userAddress, setUserAddress }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData()
      setUserAddress(userData.profile.stxAddress.testnet)
    }
  }, [setUserAddress])

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'BitSave',
        icon: 'https://freesvg.org/img/bitcoin.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData()
        setUserAddress(userData.profile.stxAddress.testnet)
      },
      userSession,
    })
  }

  const disconnectWallet = () => {
    userSession.signUserOut()
    setUserAddress(null)
  }

  if (!mounted) return null

  return (
    <div>
      {userAddress ? (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4">
          <div className="text-white">
            <p className="text-xs opacity-70">Connected</p>
            <p className="font-mono text-sm">
              {userAddress.slice(0, 8)}...{userAddress.slice(-8)}
            </p>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-8 py-4 bg-gradient-to-r from-bitcoin to-orange-600 hover:from-orange-600 hover:to-bitcoin text-white font-bold rounded-xl text-lg transition shadow-lg"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}
