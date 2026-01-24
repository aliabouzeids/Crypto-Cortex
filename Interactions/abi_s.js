"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapUsdcToWcroVVS = exports.swapWcroToUsdcVVS = exports.swapWethToUsdcUniswapV3 = exports.swapUsdcToWethUniswapV3 = void 0;
// swap usdc to weth in uniswap v3 the swap function abi:
exports.swapUsdcToWethUniswapV3 = [
    {
        name: "exactInputSingle",
        type: "function",
        stateMutability: "payable",
        inputs: [
            {
                name: "params",
                type: "tuple",
                components: [
                    { name: "tokenIn", type: "address" },
                    { name: "tokenOut", type: "address" },
                    { name: "fee", type: "uint24" },
                    { name: "recipient", type: "address" },
                    { name: "deadline", type: "uint256" },
                    { name: "amountIn", type: "uint256" },
                    { name: "amountOutMinimum", type: "uint256" },
                    { name: "sqrtPriceLimitX96", type: "uint160" }
                ]
            }
        ],
        outputs: [{ name: "amountOut", type: "uint256" }]
    }
];
// swap weth to usdc in uniswap v3 the swap function abi:
exports.swapWethToUsdcUniswapV3 = [
    {
        name: "exactInputSingle",
        type: "function",
        stateMutability: "payable",
        inputs: [
            {
                name: "params",
                type: "tuple",
                components: [
                    { name: "tokenIn", type: "address" },
                    { name: "tokenOut", type: "address" },
                    { name: "fee", type: "uint24" },
                    { name: "recipient", type: "address" },
                    { name: "deadline", type: "uint256" },
                    { name: "amountIn", type: "uint256" },
                    { name: "amountOutMinimum", type: "uint256" },
                    { name: "sqrtPriceLimitX96", type: "uint160" }
                ]
            }
        ],
        outputs: [{ name: "amountOut", type: "uint256" }]
    }
];
// swap wcro to usdc on vvs swap pool the funcion abi:
exports.swapWcroToUsdcVVS = [
    {
        name: "swapExactTokensForTokens",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "amountIn", type: "uint256" },
            { name: "amountOutMin", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "to", type: "address" },
            { name: "deadline", type: "uint256" }
        ],
        outputs: [{ name: "amounts", type: "uint256[]" }]
    }
];
// swap usdc to wcro on vvs swap pool the funcion abi:
exports.swapUsdcToWcroVVS = [
    {
        name: "swapExactTokensForTokens",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "amountIn", type: "uint256" },
            { name: "amountOutMin", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "to", type: "address" },
            { name: "deadline", type: "uint256" }
        ],
        outputs: [{ name: "amounts", type: "uint256[]" }]
    }
];
