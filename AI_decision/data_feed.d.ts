export interface AgentParams {
    wallet_balance: number;
    prices: number[];
    price_when_bought: number;
    market_state: string;
    hold_position: boolean;
    final_decision: string;
}
export declare function build_params(wallet_balance: number, prices: number[], price_when_bought: number, market_state: string, hold_position: boolean): {
    agent: AgentParams;
};
export declare function fetch_prices(): Promise<number[]>;
export declare function fetch_charts_prices(): Promise<any[]>;
export declare function has_position(balance: number, boughtPrice: number): boolean;
export declare function calculate_market_state(symbol?: string, interval?: string, limit?: number): Promise<string>;
export declare function get_wallet_balance(): Promise<number | null>;
//# sourceMappingURL=data_feed.d.ts.map