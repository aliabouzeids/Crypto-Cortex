

import 'dotenv/config';
import { createWalletClient, http, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

type ChainConfig = {
  key: string;
  id: number;
  name: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrl: string;
  router?: string;
  tokens?: Record<string, string>;
};

function requireEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}


export const chainConfigs: Record<string, ChainConfig> = {
  ethereum: {
    key: 'ethereum',
    id: 1,
    name: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.ETHEREUM_RPC ?? 'https://mainnet.infura.io/v3/cf1b77a759114db3a815944536bc117b',
    router: process.env.ETHEREUM_ROUTER ?? '0xE592427A0AEce92De3Edee1F18E0157C05861564', 
    tokens: {
      WETH: process.env.ETH_WETH ?? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      USDC: process.env.ETH_USDC ?? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
  },

  tenderly: {
    key: 'tenderly',
    id: 1,
    name: 'mainnet-ali-node',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: process.env.TENDERLY_MAINNET_FORK_RPC_URL ?? '',
    router: process.env.TENDERLY_ROUTER ?? '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    tokens: {
      WETH: process.env.TENDERLY_WETH ?? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      USDC: process.env.TENDERLY_USDC ?? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
  },

  cronos: {
    key: 'cronos',
    id: 25,
    name: 'Cronos Mainnet',
    nativeCurrency: { name: 'Cronos', symbol: 'CRO', decimals: 18 },
    rpcUrl: process.env.CRONOS_RPC ?? 'https://evm.cronos.org',
    router: process.env.CRONOS_ROUTER ?? '0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae', 
    tokens: {
      WCRO: process.env.CRONOS_WCRO ?? '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
      USDC: process.env.CRONOS_USDC ?? '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',
    },
  },
};




export function makeClient(chain: ChainConfig): WalletClient {
  const rpc = chain.rpcUrl;
  if (!rpc) {
    throw new Error(`RPC URL not configured for chain ${chain.key}. Set the appropriate env var.`);
  }

  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    throw new Error('Missing PRIVATE_KEY in environment. Set PRIVATE_KEY=0x...');
  }

  const account = privateKeyToAccount("0xed85058fad95d4b48d55f0b44e29e1120cc7b340d2805f74710e35252d9d5d5c");

  const client = createWalletClient({
    chain: {
      id: chain.id,
      name: chain.name,
      nativeCurrency: chain.nativeCurrency,
      rpcUrls: { default: { http: [rpc] } },
    },
    transport: http(rpc),
    account,
  });

  return client;
}


export { ChainConfig };
export default {
  chainConfigs,
  makeClient,
};