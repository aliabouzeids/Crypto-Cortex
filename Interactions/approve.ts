import { chainConfigs, makeClient } from './chains_clients.js';
import { encodeFunctionData, type Abi } from 'viem';



//---APPROVE---

export async function approve(chain: string, token: `0x${string}`, amount: bigint) {
  const cfg = chainConfigs[chain];
  if (!cfg || !cfg.router) throw new Error(`Unsupported chain: ${chain}`);
  const client = makeClient(cfg);

  const approveAbi: Abi = [
    {
      type: 'function',
      name: 'approve',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool' }],
    },
  ];

  const data = encodeFunctionData({
    abi: approveAbi,
    functionName: 'approve',
    args: [cfg.router as `0x${string}`, amount],
  });

  return client.sendTransaction({
    account: client.account!,
    chain: client.chain,
    to: token,
    data,
  });
}