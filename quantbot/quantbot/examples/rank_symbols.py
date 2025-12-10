import os
from typing import Callable, Dict, List

import pandas as pd

from quantbot.backtester import Backtester
from quantbot.config import AppConfig, BacktestConfig, DataConfig, RiskConfig, StrategyConfig
from quantbot.strategies import (
    DonchianBreakout,
    MeanReversion,
    Momentum,
    MovingAverageCross,
)


def strategy_factory(name: str) -> Callable[[str, dict], object]:
    mapping = {
        "ma_cross": MovingAverageCross,
        "momentum": Momentum,
        "mean_reversion": MeanReversion,
        "donchian": DonchianBreakout,
    }
    cls = mapping.get(name)
    if not cls:
        raise ValueError(f"Unknown strategy {name}")
    return lambda symbol, params: cls(symbol, params)


def run_batch(
    symbols: List[str],
    provider: str = "tushare",
    timeframe: str = "1d",
    start: str = "2024-01-01",
    strategy_name: str = "ma_cross",
    strategy_params: Dict = None,
) -> pd.DataFrame:
    strategy_params = strategy_params or {}
    rows = []
    for sym in symbols:
        cfg = AppConfig(
            data=DataConfig(
                symbol=sym,
                timeframe=timeframe,
                start=start,
                end=None,
                provider=provider,
            ),
            strategy=StrategyConfig(name=strategy_name, params=strategy_params),
            risk=RiskConfig(max_position_pct=0.3, daily_stop_pct=0.1),
            backtest=BacktestConfig(initial_cash=100_000, slippage_bps=2, commission_bps=1),
        )
        bt = Backtester(cfg, strategy_factory=strategy_factory(strategy_name))
        result = bt.run()
        stats = result.stats
        rows.append(
            {
                "symbol": sym,
                "total_return": stats.get("total_return", 0),
                "max_drawdown": stats.get("max_drawdown", 0),
                "sharpe": stats.get("sharpe", 0),
                "final_equity": stats.get("final_equity", 0),
            }
        )
    df = pd.DataFrame(rows)
    df = df.sort_values("total_return", ascending=False)
    return df


def main():
    # 设置你的标的列表
    symbols = ["000001.SZ", "600519.SH", "000858.SZ", "601318.SH", "300750.SZ"]
    # 选择策略：ma_cross / momentum / mean_reversion / donchian
    strategy_name = "ma_cross"
    strategy_params = {"fast": 5, "slow": 20}

    df = run_batch(
        symbols=symbols,
        provider=os.getenv("PROVIDER", "tushare"),
        timeframe="1d",
        start="2024-01-01",
        strategy_name=strategy_name,
        strategy_params=strategy_params,
    )
    print(df)
    try:
        import matplotlib.pyplot as plt  # type: ignore

        fig, ax = plt.subplots(figsize=(8, 4))
        ax.bar(df["symbol"], df["total_return"])
        ax.set_title(f"{strategy_name} total return ranking")
        ax.set_ylabel("Total Return")
        plt.xticks(rotation=30, ha="right")
        plt.tight_layout()
        outfile = "rank_total_return.png"
        plt.savefig(outfile)
        print(f"Saved bar chart to {outfile}")
    except Exception as exc:
        print(f"Plot skipped: {exc}")


if __name__ == "__main__":
    main()
