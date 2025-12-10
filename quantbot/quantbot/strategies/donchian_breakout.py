from __future__ import annotations

import pandas as pd

from quantbot.strategy import Order, Strategy
from quantbot.data.providers import Bar


class DonchianBreakout(Strategy):
    """Donchian channel breakout."""

    def __init__(self, symbol: str, params: dict):
        self.symbol = symbol
        self.lookback = int(params.get("lookback", 20))
        self.exit_lookback = int(params.get("exit_lookback", 10))
        self.position = 0
        self.size = float(params.get("size", 100))

    def on_start(self, history):
        pass

    def on_bar(self, bar: Bar, history):
        highs = pd.Series([b.high for b in history] + [bar.high])
        lows = pd.Series([b.low for b in history] + [bar.low])
        if len(highs) <= self.lookback:
            return []

        entry_high = highs.iloc[-self.lookback :].max()
        exit_low = lows.iloc[-self.exit_lookback :].min()

        orders = []
        if bar.close >= entry_high and self.position <= 0:
            orders.append(Order(side="buy", size=self.size))
            self.position = 1
        elif bar.close <= exit_low and self.position > 0:
            orders.append(Order(side="sell", size=self.size))
            self.position = 0
        return orders

    def on_stop(self):
        pass
