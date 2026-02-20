"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, ExternalLink } from "lucide-react";
import { connectWallet, disconnectWallet, userSession } from "@/lib/stacks";
import { EXPLORER_URLS } from "@/lib/contracts";

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const address = userData.profile.stxAddress.testnet;
      setUserAddress(address);
      setIsConnected(true);
      onConnect?.(address);
    }
  }, [onConnect]);

  const handleConnect = () => {
    connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsConnected(false);
    setUserAddress("");
    onDisconnect?.();
  };

  if (isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Your Stacks wallet is connected and ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address:</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {userAddress.slice(0, 8)}...{userAddress.slice(-8)}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(EXPLORER_URLS.address(userAddress), '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Explorer
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your Stacks wallet to start saving
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleConnect}
          className="w-full"
          size="lg"
        >
          Connect Stacks Wallet
        </Button>
      </CardContent>
    </Card>
  );
}
