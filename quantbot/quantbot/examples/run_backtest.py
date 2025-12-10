from quantbot.backtester import Backtester
from quantbot.config import AppConfig, BacktestConfig, DataConfig, RiskConfig, StrategyConfig
from quantbot.strategies.ma_cross import MovingAverageCross


def main():
    cfg = AppConfig(
        data=DataConfig(
            symbol="000001.SZ",  # 平安银行示例
            timeframe="1d",
            start="2024-01-01",
            end=None,
            provider="tushare",
        ),
        strategy=StrategyConfig(name="ma_cross", params={"fast": 5, "slow": 20}),
        risk=RiskConfig(max_position_pct=0.3, daily_stop_pct=0.05),
        backtest=BacktestConfig(initial_cash=100_000, slippage_bps=2, commission_bps=1),
    )

    bt = Backtester(cfg, strategy_factory=lambda symbol, params: MovingAverageCross(symbol, params))
    result = bt.run()
    print("Backtest stats:", result.stats)
    print("Final equity:", result.stats.get("final_equity"))


if __name__ == "__main__":
    main()
