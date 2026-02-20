export const NETWORK_CONFIG = {
  testnet: {
    url: 'https://api.testnet.hiro.so',
    chainId: 2147483648,
    name: 'Testnet'
  },
  mainnet: {
    url: 'https://api.hiro.so',
    chainId: 1,
    name: 'Mainnet'
  }
} as const;

export const CURRENT_NETWORK = 'testnet';
export const BLOCKS_PER_DAY = 144;
export const BLOCKS_PER_WEEK = 1008;
export const BLOCKS_PER_MONTH = 4320;
export const BLOCKS_PER_YEAR = 52560;
