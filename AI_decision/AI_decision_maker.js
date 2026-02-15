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
exports.setBoughtPrice = setBoughtPrice;
exports.setAmount = setAmount;
exports.setTolerance = setTolerance;
exports.setIntervalTime = setIntervalTime;
exports.stopAgent = stopAgent;
var AI_Brain_js_1 = require("./AI_Brain.js");
var data_feed_js_1 = require("./data_feed.js");
var calls_js_1 = require("../Interactions/calls.js");
var interval_time = 1 * 60 * 1000;
var last_price = 0;
var price_when_bought = 2000;
var buy_amount = 50;
var tolerance = 10;
var loopId = null;
function setBoughtPrice() {
    if (last_price > 0)
        price_when_bought = last_price;
}
function setAmount(amount) {
    if (amount > 0)
        buy_amount = amount;
    else
        alert("amount is not enough");
}
function setTolerance(_tolerance) {
    if (_tolerance > 0)
        tolerance = _tolerance;
    else
        alert("tolerance is not enough");
}
function setIntervalTime(_interval) {
    if (_interval >= 1 * 60 * 1000)
        interval_time = _interval;
}
///==========core functions==================
function buy(amount) {
    return __awaiter(this, void 0, void 0, function () {
        var chain, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    chain = (_a = process.env.ACTIVE_CHAIN) !== null && _a !== void 0 ? _a : "tenderly";
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, calls_js_1.buy)(chain, amount)];
                case 2:
                    _b.sent();
                    console.log("Executed BUY of ".concat(amount, " on ").concat(chain));
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    console.error("Buy failed:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function sell() {
    return __awaiter(this, void 0, void 0, function () {
        var chain, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    chain = (_a = process.env.ACTIVE_CHAIN) !== null && _a !== void 0 ? _a : "ethereum";
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, calls_js_1.sell)(chain)];
                case 2:
                    _b.sent();
                    console.log("Executed SELL (all balance) on ".concat(chain));
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _b.sent();
                    console.error("Sell failed:", err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function unknown_error() {
    console.error("Unknown error occurred");
}
function insufficient_balance() {
    console.error("Not enough balance to execute trade");
}
///================STOP BOT=================
function stopAgent() {
    if (loopId) {
        clearInterval(loopId);
        loopId = null;
        console.log("Agent loop stopped.");
    }
    else {
        console.log("Agent loop is not running.");
    }
}
///================LOOP BOT=================
function make_decision() {
    return __awaiter(this, void 0, void 0, function () {
        var wallet_balance, price, _a, market_state, confidence, _b, hold_position, balanceEth, params, result, decision, err_3, err_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 14, , 15]);
                    return [4 /*yield*/, (0, data_feed_js_1.get_wallet_balance)()];
                case 1:
                    wallet_balance = _c.sent();
                    if (wallet_balance === null) {
                        console.error("Wallet balance unavailable");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, data_feed_js_1.fetch_price)()];
                case 2:
                    price = _c.sent();
                    last_price = price;
                    return [4 /*yield*/, (0, data_feed_js_1.calculate_market_state)()];
                case 3:
                    _a = _c.sent(), market_state = _a.market_state, confidence = _a.confidence;
                    return [4 /*yield*/, (0, data_feed_js_1.hasWeth)()];
                case 4:
                    _b = _c.sent(), hold_position = _b.hold_position, balanceEth = _b.balanceEth;
                    if (!hold_position)
                        price_when_bought = 0;
                    params = (0, data_feed_js_1.build_params)(wallet_balance, buy_amount, price, price_when_bought, tolerance, market_state, confidence, hold_position);
                    return [4 /*yield*/, AI_Brain_js_1.default.invoke(params)];
                case 5:
                    result = _c.sent();
                    console.log("Weth balance: ".concat(balanceEth, " so does it Hold Position? ").concat(result.agent.hold_position, " Market state: ").concat(result.agent.market_state, " [").concat(new Date().toLocaleTimeString(), "] Decision: ").concat(result.agent.final_decision, " | Latest Price: ").concat(price));
                    decision = result.agent.final_decision;
                    if (!(decision === "buy")) return [3 /*break*/, 7];
                    console.log("buying...");
                    return [4 /*yield*/, buy(1000)];
                case 6:
                    _c.sent();
                    return [3 /*break*/, 13];
                case 7:
                    if (!(decision === "sell")) return [3 /*break*/, 12];
                    console.log("selling...");
                    _c.label = 8;
                case 8:
                    _c.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, sell()];
                case 9:
                    _c.sent();
                    return [3 /*break*/, 11];
                case 10:
                    err_3 = _c.sent();
                    console.error("Sell failed:", err_3);
                    return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (decision === "hold") {
                        console.log("holding...");
                    }
                    else if (decision === "not_enough_balance") {
                        insufficient_balance();
                    }
                    else {
                        unknown_error();
                    }
                    _c.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    err_4 = _c.sent();
                    console.error("Unkown error:", err_4); // only Allah know
                    unknown_error();
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
make_decision();
loopId = setInterval(make_decision, interval_time);
// let me guide u to the existing page.js:
// its here:`https://github.com/aliabouzeids/Crypto-Cortex/blob/main/UI/app/page.js`
// as u can see its not connected to any of the backend files now its an empty shell
