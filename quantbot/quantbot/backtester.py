from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Callable, Dict, List

import pandas as pd

from .config import AppConfig
from .data.providers import Bar, get_provider
from .portfolio import Portfolio
from .strategy import Order, Strategy


@dataclass
class BacktestResult:
    equity_curve: pd.Series
    stats: Dict[str, float]


class Backtester:
    def __init__(self, config: AppConfig, strategy_factory: Callable[[str, dict], Strategy]):
        self.config = config
        self.strategy = strategy_factory(config.data.symbol, config.strategy.params)
        self.provider = get_provider(config.data.provider)
        self.portfolio = Portfolio(cash=config.backtest.initial_cash)

    def run(self) -> BacktestResult:
        df = self.provider.fetch_history(
            symbol=self.config.data.symbol,
            start=self.config.data.start,
            end=self.config.data.end,
            interval=self.config.data.timeframe,
        )
        history: List[Bar] = []
        self.strategy.on_start(history)

        peak_equity = self.portfolio.cash
        equity_series = []

        for ts, row in df.iterrows():
            bar = Bar(
                ts=pd.to_datetime(ts),
                open=float(row["open"]),
                high=float(row["high"]),
                low=float(row["low"]),
                close=float(row["close"]),
                volume=float(row["volume"]),
            )
            orders = self.strategy.on_bar(bar, history) or []
            for order in orders:
                if not self._passes_risk(order, bar):
                    continue
                self.portfolio.process_order(
                    self.config.data.symbol,
                    order,
                    price=bar.close,
                    commission_bps=self.config.backtest.commission_bps,
                    slippage_bps=self.config.backtest.slippage_bps,
                )
            history.append(bar)
            equity = self.portfolio.snapshot(lambda _: bar.close)
            equity_series.append((bar.ts, equity))
            peak_equity = max(peak_equity, equity)
            if self._breached_drawdown(equity, peak_equity):
                break

        equity_curve = pd.Series(
            data=[eq for _, eq in equity_series],
            index=[ts for ts, _ in equity_series],
        )
        stats = self._compute_stats(equity_curve)
        return BacktestResult(equity_curve=equity_curve, stats=stats)

    def _passes_risk(self, order: Order, bar: Bar) -> bool:
        max_value = self.config.backtest.initial_cash * self.config.risk.max_position_pct
        notional = bar.close * order.size
        if notional > max_value:
            return False
        return True

    def _breached_drawdown(self, equity: float, peak_equity: float) -> bool:
        if peak_equity == 0:
            return False
        drop = (peak_equity - equity) / peak_equity
        return drop >= self.config.risk.daily_stop_pct

    def _compute_stats(self, equity_curve: pd.Series) -> Dict[str, float]:
        if equity_curve.empty:
            return {}
        returns = equity_curve.pct_change().fillna(0)
        total_return = (equity_curve.iloc[-1] / equity_curve.iloc[0]) - 1
        max_dd = self._max_drawdown(equity_curve)
        sharpe = self._sharpe_ratio(returns)
        return {
            "total_return": float(total_return),
            "max_drawdown": float(max_dd),
            "sharpe": float(sharpe),
            "final_equity": float(equity_curve.iloc[-1]),
        }

    @staticmethod
    def _max_drawdown(equity_curve: pd.Series) -> float:
        peak = equity_curve.cummax()
        dd = (peak - equity_curve) / peak
        return dd.max()

    @staticmethod
    def _sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.0) -> float:
        # Assume daily data; annualize with sqrt(252)
        excess = returns - risk_free_rate / 252
        vol = excess.std()
        if vol == 0:
            return 0.0
        return (excess.mean() * 252) / (vol * math.sqrt(252))
