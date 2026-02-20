'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

interface WalletContextType {
  userSession: UserSession | null;
  address: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const appConfig = new AppConfig(['store_write', 'publish_data']);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [userSession] = useState(() => new UserSession({ appConfig }));
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setAddress(userData.profile.stxAddress.testnet);
      setIsConnected(true);
    }
  }, [userSession]);

  const connect = () => {
    showConnect({
      appDetails: {
        name: 'BitSave',
        icon: '/logo.png',
      },
      onFinish: () => {
        const userData = userSession.loadUserData();
        setAddress(userData.profile.stxAddress.testnet);
        setIsConnected(true);
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setAddress(null);
    setIsConnected(false);
  };

  return (
    <WalletContext.Provider value={{ userSession, address, isConnected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
