// Contract addresses and explorer URLs
export const CONTRACTS = {
  BITSAVE: 'ST2QR5BT57BTVQM69ZFQBMW3BH7KDN3FX56H02TEW.bitsave',
  BADGES: 'ST2QR5BT57BTVQM69ZFQBMW3BH7KDN3FX56H02TEW.bitsave-badges'
};

export const EXPLORER_URLS = {
  address: (address: string) => `https://explorer.hiro.so/address/${address}?chain=testnet`,
  contract: (contract: string) => `https://explorer.hiro.so/txid/${contract}?chain=testnet`,
  transaction: (txId: string) => `https://explorer.hiro.so/txid/${txId}?chain=testnet`
};
