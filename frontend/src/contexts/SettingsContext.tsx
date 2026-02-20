'use client';

import { createContext, useContext, ReactNode } from 'react';

interface ContextType {}

const Context = createContext<ContextType | undefined>(undefined);

export function Provider({ children }: { children: ReactNode }) {
  return <Context.Provider value={{}}>{children}</Context.Provider>;
}

export function useContextHook() {
  const context = useContext(Context);
  if (!context) throw new Error('useContextHook must be used within Provider');
  return context;
}
