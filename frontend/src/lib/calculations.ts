export function calculateReward(amount: bigint, rate: bigint, blocks: bigint): bigint {
  const periods = blocks / BigInt(4320); // Monthly periods
  return (amount * rate * periods) / BigInt(100);
}

export function calculateEarlyWithdrawalPenalty(amount: bigint, penaltyRate: bigint): bigint {
  return (amount * penaltyRate) / BigInt(100);
}

export function calculateReputationPoints(amount: bigint, lockPeriod: bigint): bigint {
  return (amount * lockPeriod) / BigInt(10000);
}
