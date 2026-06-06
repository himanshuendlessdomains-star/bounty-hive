// Contract addresses — switch between testnet and mainnet

export const CONTRACTS = {
  testnet: {
    factoryAddress: 'EQD..._TESTNET_FACTORY_ADDRESS', // replace after deploy
  },
  mainnet: {
    factoryAddress: 'EQD..._MAINNET_FACTORY_ADDRESS', // replace after deploy
  },
};

export const IS_TESTNET = import.meta.env.VITE_TON_NETWORK !== 'mainnet';

export function getFactoryAddress(): string {
  return IS_TESTNET
    ? CONTRACTS.testnet.factoryAddress
    : CONTRACTS.mainnet.factoryAddress;
}

export const TONCENTER_API = IS_TESTNET
  ? 'https://testnet.toncenter.com/api/v2/'
  : 'https://toncenter.com/api/v2/';

export const TON_API_ENDPOINT = IS_TESTNET
  ? 'https://testnet.tonapi.io/v2/'
  : 'https://tonapi.io/v2/';
