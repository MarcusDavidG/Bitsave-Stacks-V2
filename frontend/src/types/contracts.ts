// Type definitions for BitSave contracts
export interface SavingsInfo {
  amount: bigint;
  unlockHeight: bigint;
  claimed: boolean;
  goalAmount: bigint;
  goalDescription: string;
}

export interface ReputationInfo {
  points: bigint;
  currentStreak: bigint;
  longestStreak: bigint;
  lastDepositBlock: bigint;
}

export interface DepositHistoryEntry {
  amount: bigint;
  timestamp: bigint;
  lockPeriod: bigint;
  goalAmount: bigint;
  status: string;
}

export interface BadgeMetadata {
  tokenId: bigint;
  owner: string;
  metadata: string;
  mintedAt?: bigint;
}

export interface ContractEvent {
  eventId: bigint;
  eventType: string;
  user: string;
  amount: bigint;
  timestamp: bigint;
  data: string;
}

export interface RateHistoryEntry {
  timestamp: bigint;
  rate: bigint;
  admin: string;
}

export interface ReferralStats {
  totalReferrals: bigint;
  totalBonus: bigint;
  activeReferrals: bigint;
}
