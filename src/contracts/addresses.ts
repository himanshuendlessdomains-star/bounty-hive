// Contract addresses — set VITE_TESTNET_FACTORY_ADDRESS / VITE_MAINNET_FACTORY_ADDRESS
// in Vercel environment variables after deploying contracts.

export const IS_TESTNET = import.meta.env.VITE_TON_NETWORK !== 'mainnet';

export const CONTRACTS = {
  testnet: {
    factoryAddress: import.meta.env.VITE_TESTNET_FACTORY_ADDRESS ?? '',
  },
  mainnet: {
    factoryAddress: import.meta.env.VITE_MAINNET_FACTORY_ADDRESS ?? '',
  },
};

export function getFactoryAddress(): string {
  return IS_TESTNET ? CONTRACTS.testnet.factoryAddress : CONTRACTS.mainnet.factoryAddress;
}

export const TONCENTER_API = IS_TESTNET
  ? 'https://testnet.toncenter.com/api/v2/'
  : 'https://toncenter.com/api/v2/';

export const TON_API_ENDPOINT = IS_TESTNET
  ? 'https://testnet.tonapi.io/v2/'
  : 'https://tonapi.io/v2/';
