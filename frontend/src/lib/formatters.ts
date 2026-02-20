export function formatSTX(microSTX: bigint): string {
  return (Number(microSTX) / 1_000_000).toFixed(6);
}

export function parseSTX(stx: string): bigint {
  return BigInt(Math.floor(parseFloat(stx) * 1_000_000));
}

export function formatBlockHeight(blocks: bigint): string {
  const num = Number(blocks);
  if (num >= 52560) return `${(num / 52560).toFixed(1)} years`;
  if (num >= 4320) return `${(num / 4320).toFixed(1)} months`;
  if (num >= 1008) return `${(num / 1008).toFixed(1)} weeks`;
  if (num >= 144) return `${(num / 144).toFixed(1)} days`;
  return `${num} blocks`;
}

export function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
