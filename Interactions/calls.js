"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buy = buy;
exports.sell = sell;
var chains_clients_js_1 = require("./chains_clients.js");
var abi_s_js_1 = require("./abi_s.js");
var viem_1 = require("viem");
var data_feed_js_1 = require("../AI_decision/data_feed.js");
var AI_decision_maker_js_1 = require("../AI_decision/AI_decision_maker.js");
var approve_js_1 = require("./approve.js");
var viem_2 = require("viem");
function getDeadline() {
    return BigInt(Math.floor(Date.now() / 1000) + 60 * 10);
}
// --- BUY ---
function buy(chain, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, client, deadline, amountIn, data, tx, receipt, data, tx, receipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cfg = chains_clients_js_1.chainConfigs[chain];
                    if (!cfg || !cfg.tokens || !cfg.router)
                        throw new Error("Unsupported chain: ".concat(chain));
                    client = (0, chains_clients_js_1.makeClient)(cfg);
                    deadline = getDeadline();
                    amountIn = (0, viem_1.parseUnits)(amount.toString(), 6);
                    // approve USDC before swap
                    return [4 /*yield*/, (0, approve_js_1.approve)(chain, cfg.tokens.USDC, amountIn)];
                case 1:
                    // approve USDC before swap
                    _a.sent();
                    if (!(chain === 'ethereum' || chain === 'tenderly')) return [3 /*break*/, 4];
                    data = (0, viem_1.encodeFunctionData)({
                        abi: abi_s_js_1.swapUsdcToWethUniswapV3,
                        functionName: 'exactInputSingle',
                        args: [{
                                tokenIn: cfg.tokens.USDC,
                                tokenOut: cfg.tokens.WETH,
                                fee: 3000,
                                recipient: client.account.address,
                                deadline: deadline,
                                amountIn: amountIn,
                                amountOutMinimum: 0n,
                                sqrtPriceLimitX96: 0n,
                            }],
                    });
                    return [4 /*yield*/, client.sendTransaction({
                            account: client.account,
                            chain: client.chain,
                            to: cfg.router,
                            data: data,
                            kzg: undefined
                        })];
                case 2:
                    tx = _a.sent();
                    return [4 /*yield*/, (0, viem_2.publicActions)(client).waitForTransactionReceipt({ hash: tx })];
                case 3:
                    receipt = _a.sent();
                    if (receipt)
                        (0, AI_decision_maker_js_1.setBoughtPrice)();
                    return [2 /*return*/, receipt];
                case 4:
                    if (!(chain === 'cronos')) return [3 /*break*/, 7];
                    data = (0, viem_1.encodeFunctionData)({
                        abi: abi_s_js_1.swapUsdcToWcroVVS,
                        functionName: 'swapExactTokensForTokens',
                        args: [
                            amountIn,
                            0n,
                            [cfg.tokens.USDC, cfg.tokens.WCRO],
                            client.account.address,
                            deadline,
                        ],
                    });
                    return [4 /*yield*/, client.sendTransaction({
                            account: client.account,
                            chain: client.chain,
                            to: cfg.router,
                            data: data,
                            kzg: undefined
                        })];
                case 5:
                    tx = _a.sent();
                    return [4 /*yield*/, (0, viem_2.publicActions)(client).waitForTransactionReceipt({ hash: tx })];
                case 6:
                    receipt = _a.sent();
                    if (receipt)
                        (0, AI_decision_maker_js_1.setBoughtPrice)();
                    return [2 /*return*/, receipt];
                case 7: throw new Error("Unsupported chain for buy: ".concat(chain));
            }
        });
    });
}
// --- SELL (sells everything) ---
function sell(chain) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, client, deadline, balanceEth, balanceWei, tokenToSell, data, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cfg = chains_clients_js_1.chainConfigs[chain];
                    if (!cfg || !cfg.tokens || !cfg.router)
                        throw new Error("Unsupported chain: ".concat(chain));
                    client = (0, chains_clients_js_1.makeClient)(cfg);
                    deadline = getDeadline();
                    return [4 /*yield*/, (0, data_feed_js_1.get_wallet_balance)()];
                case 1:
                    balanceEth = _a.sent();
                    if (!balanceEth || balanceEth <= 0)
                        throw new Error("No balance to sell");
                    balanceWei = (0, viem_1.parseEther)(balanceEth.toString());
                    tokenToSell = chain === 'cronos' ? cfg.tokens.WCRO : cfg.tokens.WETH;
                    return [4 /*yield*/, (0, approve_js_1.approve)(chain, tokenToSell, balanceWei)];
                case 2:
                    _a.sent();
                    if (chain === 'ethereum' || chain === 'tenderly') {
                        data = (0, viem_1.encodeFunctionData)({
                            abi: abi_s_js_1.swapWethToUsdcUniswapV3,
                            functionName: 'exactInputSingle',
                            args: [{
                                    tokenIn: cfg.tokens.WETH,
                                    tokenOut: cfg.tokens.USDC,
                                    fee: 3000,
                                    recipient: client.account.address,
                                    deadline: deadline,
                                    amountIn: balanceWei,
                                    amountOutMinimum: 0n,
                                    sqrtPriceLimitX96: 0n,
                                }],
                        });
                        return [2 /*return*/, client.sendTransaction({
                                account: client.account,
                                chain: client.chain,
                                to: cfg.router,
                                data: data,
                                kzg: undefined
                            })];
                    }
                    if (chain === 'cronos') {
                        data = (0, viem_1.encodeFunctionData)({
                            abi: abi_s_js_1.swapWcroToUsdcVVS,
                            functionName: 'swapExactTokensForTokens',
                            args: [
                                balanceWei,
                                0n,
                                [cfg.tokens.WCRO, cfg.tokens.USDC],
                                client.account.address,
                                deadline,
                            ],
                        });
                        return [2 /*return*/, client.sendTransaction({
                                account: client.account,
                                chain: client.chain,
                                to: cfg.router,
                                data: data,
                                kzg: undefined
                            })];
                    }
                    throw new Error("Unsupported chain for sell: ".concat(chain));
            }
        });
    });
}
