"use client";

import { useState } from "react";
import { WalletConnect } from "@/components/wallet-connect";
import { DepositForm } from "@/components/deposit-form";
import { WithdrawForm } from "@/components/withdraw-form";
import { ReputationDashboard } from "@/components/reputation-dashboard";
import { BadgeShowcase } from "@/components/badge-showcase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Shield, TrendingUp, Award, Bitcoin, Sparkles } from "lucide-react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleConnect = (address: string) => {
    setUserAddress(address);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setUserAddress("");
  };

  const handleTransactionSuccess = () => {
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000);
  };

  const features = [
    {
      icon: Shield,
      title: "Bitcoin Security",
      description: "Built on Stacks, inheriting Bitcoin's unmatched security model"
    },
    {
      icon: TrendingUp,
      title: "Guaranteed Returns",
      description: "Earn predictable yields on your locked STX tokens"
    },
    {
      icon: Award,
      title: "NFT Achievements",
      description: "Collect unique badges as proof of your saving milestones"
    },
    {
      icon: PiggyBank,
      title: "Smart Contracts",
      description: "Transparent, auditable, and non-custodial savings protocol"
    }
  ];

  const stats = [
    { label: "Total Value Locked", value: "1.2M STX" },
    { label: "Active Savers", value: "2,847" },
    { label: "Badges Earned", value: "1,234" },
    { label: "Average APY", value: "12.5%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <PiggyBank className="h-8 w-8 text-primary" />
                <Bitcoin className="h-4 w-4 text-orange-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  BitSave
                </h1>
                <p className="text-xs text-muted-foreground">Bitcoin-Powered Savings</p>
              </div>
            </div>
            
            <Badge variant="secondary" className="hidden sm:flex">
              🟢 Live on Testnet
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Decentralized Savings Protocol
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Bitcoin-Secured
            <br />
            <span className="text-primary">Savings Vault</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Lock STX tokens, earn guaranteed returns, and build your on-chain reputation. 
            Experience the future of decentralized savings.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose BitSave?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of decentralized savings with our innovative features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main App */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {isConnected ? "Your Savings Dashboard" : "Get Started"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isConnected 
                ? "Manage your deposits, track rewards, and monitor your reputation" 
                : "Connect your wallet to start saving and earning rewards"
              }
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="flex justify-center mb-12">
            <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
          </div>

          {/* Dashboard */}
          {isConnected && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Forms */}
              <div className="xl:col-span-2 space-y-8">
                <DepositForm 
                  userAddress={userAddress}
                  isConnected={isConnected}
                  onSuccess={handleTransactionSuccess}
                />
                <WithdrawForm
                  userAddress={userAddress}
                  isConnected={isConnected}
                  onSuccess={handleTransactionSuccess}
                />
              </div>

              {/* Reputation */}
              <div key={refreshKey} className="xl:col-span-1">
                <ReputationDashboard
                  userAddress={userAddress}
                  isConnected={isConnected}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Badge Showcase */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <BadgeShowcase />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12 px-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <PiggyBank className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">BitSave</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Secure, decentralized savings powered by Bitcoin's security
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ on Stacks • Secured by Bitcoin
          </p>
        </div>
      </footer>
    </div>
  );
}
