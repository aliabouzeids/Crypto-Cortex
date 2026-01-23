import { chainConfigs, makeClient } from './chains_clients.js';
import {
  swapUsdcToWethUniswapV3,
  swapWethToUsdcUniswapV3,
  swapUsdcToWcroVVS,
  swapWcroToUsdcVVS,
} from './abi_s.js';
import { encodeFunctionData, type Abi, parseEther, parseUnits } from 'viem';
import { get_wallet_balance } from '../AI_decision/data_feed.js';
import { approve } from './approve.js'; // <-- your approve function

function getDeadline(): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + 60 * 10);
}

// --- BUY ---
export async function buy(chain: string, amount: number) {
  const cfg = chainConfigs[chain];
  if (!cfg || !cfg.tokens || !cfg.router) throw new Error(`Unsupported chain: ${chain}`);
  const client = makeClient(cfg);
  const deadline = getDeadline();

  const amountIn = parseUnits(amount.toString(), 6);

  // approve USDC before swap
  await approve(chain, cfg.tokens.USDC as `0x${string}`, amountIn);

  if (chain === 'ethereum' || chain === 'tenderly') {
    const data = encodeFunctionData({
      abi: swapUsdcToWethUniswapV3 as Abi,
      functionName: 'exactInputSingle',
      args: [{
        tokenIn: cfg.tokens.USDC as `0x${string}`,
        tokenOut: cfg.tokens.WETH as `0x${string}`,
        fee: 3000,
        recipient: client.account!.address as `0x${string}`,
        deadline,
        amountIn,
        amountOutMinimum: 0n,
        sqrtPriceLimitX96: 0n,
      }],
    });

    return client.sendTransaction({
      account: client.account!,
      chain: client.chain,
      to: cfg.router as `0x${string}`,
      data,
    });
  }

  if (chain === 'cronos') {
    const data = encodeFunctionData({
      abi: swapUsdcToWcroVVS as Abi,
      functionName: 'swapExactTokensForTokens',
      args: [
        amountIn,
        0n,
        [cfg.tokens.USDC as `0x${string}`, cfg.tokens.WCRO as `0x${string}`],
        client.account!.address as `0x${string}`,
        deadline,
      ],
    });

    return client.sendTransaction({
      account: client.account!,
      chain: client.chain,
      to: cfg.router as `0x${string}`,
      data,
    });
  }

  throw new Error(`Unsupported chain for buy: ${chain}`);
}

// --- SELL (sells everything) ---
export async function sell(chain: string) {
  const cfg = chainConfigs[chain];
  if (!cfg || !cfg.tokens || !cfg.router) throw new Error(`Unsupported chain: ${chain}`);
  const client = makeClient(cfg);
  const deadline = getDeadline();

  const balanceEth = await get_wallet_balance();
  if (!balanceEth || balanceEth <= 0) throw new Error("No balance to sell");
  const balanceWei = parseEther(balanceEth.toString());

  // approve WETH/WCRO before swap
  const tokenToSell = chain === 'cronos' ? cfg.tokens.WCRO : cfg.tokens.WETH;
  await approve(chain, tokenToSell as `0x${string}`, balanceWei);

  if (chain === 'ethereum' || chain === 'tenderly') {
    const data = encodeFunctionData({
      abi: swapWethToUsdcUniswapV3 as Abi,
      functionName: 'exactInputSingle',
      args: [{
        tokenIn: cfg.tokens.WETH as `0x${string}`,
        tokenOut: cfg.tokens.USDC as `0x${string}`,
        fee: 3000,
        recipient: client.account!.address as `0x${string}`,
        deadline,
        amountIn: balanceWei,
        amountOutMinimum: 0n,
        sqrtPriceLimitX96: 0n,
      }],
    });

    return client.sendTransaction({
      account: client.account!,
      chain: client.chain,
      to: cfg.router as `0x${string}`,
      data,
    });
  }

  if (chain === 'cronos') {
    const data = encodeFunctionData({
      abi: swapWcroToUsdcVVS as Abi,
      functionName: 'swapExactTokensForTokens',
      args: [
        balanceWei,
        0n,
        [cfg.tokens.WCRO as `0x${string}`, cfg.tokens.USDC as `0x${string}`],
        client.account!.address as `0x${string}`,
        deadline,
      ],
    });

    return client.sendTransaction({
      account: client.account!,
      chain: client.chain, 
      to: cfg.router as `0x${string}`,
      data,
    });
  }

  throw new Error(`Unsupported chain for sell: ${chain}`);
}