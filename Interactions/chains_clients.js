"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainConfigs = void 0;
exports.makeClient = makeClient;
require("dotenv/config");
var viem_1 = require("viem");
var accounts_1 = require("viem/accounts");
function requireEnv(name, fallback) {
    var _a;
    var v = (_a = process.env[name]) !== null && _a !== void 0 ? _a : fallback;
    if (!v)
        throw new Error("Missing required env var: ".concat(name));
    return v;
}
exports.chainConfigs = {
    ethereum: {
        key: 'ethereum',
        id: 1,
        name: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrl: (_a = process.env.ETHEREUM_RPC) !== null && _a !== void 0 ? _a : 'https://mainnet.infura.io/v3/cf1b77a759114db3a815944536bc117b',
        router: (_b = process.env.ETHEREUM_ROUTER) !== null && _b !== void 0 ? _b : '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        tokens: {
            WETH: (_c = process.env.ETH_WETH) !== null && _c !== void 0 ? _c : '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            USDC: (_d = process.env.ETH_USDC) !== null && _d !== void 0 ? _d : '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        },
    },
    tenderly: {
        key: 'tenderly',
        id: 1,
        name: 'mainnet-ali-node',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrl: (_e = process.env.TENDERLY_MAINNET_FORK_RPC_URL) !== null && _e !== void 0 ? _e : '',
        router: (_f = process.env.TENDERLY_ROUTER) !== null && _f !== void 0 ? _f : '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        tokens: {
            WETH: (_g = process.env.TENDERLY_WETH) !== null && _g !== void 0 ? _g : '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            USDC: (_h = process.env.TENDERLY_USDC) !== null && _h !== void 0 ? _h : '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        },
    },
    cronos: {
        key: 'cronos',
        id: 25,
        name: 'Cronos Mainnet',
        nativeCurrency: { name: 'Cronos', symbol: 'CRO', decimals: 18 },
        rpcUrl: (_j = process.env.CRONOS_RPC) !== null && _j !== void 0 ? _j : 'https://evm.cronos.org',
        router: (_k = process.env.CRONOS_ROUTER) !== null && _k !== void 0 ? _k : '0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae',
        tokens: {
            WCRO: (_l = process.env.CRONOS_WCRO) !== null && _l !== void 0 ? _l : '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
            USDC: (_m = process.env.CRONOS_USDC) !== null && _m !== void 0 ? _m : '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',
        },
    },
};
function makeClient(chain) {
    var rpc = chain.rpcUrl;
    if (!rpc) {
        throw new Error("RPC URL not configured for chain ".concat(chain.key, ". Set the appropriate env var."));
    }
    var pk = process.env.PRIVATE_KEY;
    if (!pk) {
        throw new Error('Missing PRIVATE_KEY in environment. Set PRIVATE_KEY=0x...');
    }
    var account = (0, accounts_1.privateKeyToAccount)(pk);
    var client = (0, viem_1.createWalletClient)({
        chain: {
            id: chain.id,
            name: chain.name,
            nativeCurrency: chain.nativeCurrency,
            rpcUrls: { default: { http: [rpc] } },
        },
        transport: (0, viem_1.http)(rpc),
        account: account,
    });
    return client;
}
exports.default = {
    chainConfigs: exports.chainConfigs,
    makeClient: makeClient,
};
