from __future__ import annotations

import pandas as pd

from quantbot.strategy import Order, Strategy
from quantbot.data.providers import Bar


class MeanReversion(Strategy):
    """Z-score based mean reversion on closing prices."""

    def __init__(self, symbol: str, params: dict):
        self.symbol = symbol
        self.lookback = int(params.get("lookback", 20))
        self.entry_z = float(params.get("entry_z", 1.0))
        self.exit_z = float(params.get("exit_z", 0.2))
        self.position = 0
        self.size = float(params.get("size", 100))

    def on_start(self, history):
        pass

    def on_bar(self, bar: Bar, history):
        closes = pd.Series([b.close for b in history] + [bar.close])
        if len(closes) <= self.lookback:
            return []
        window = closes.iloc[-self.lookback :]
        mean = window.mean()
        std = window.std(ddof=0)
        if std == 0:
            return []
        z = (closes.iloc[-1] - mean) / std

        orders = []
        if z <= -self.entry_z and self.position <= 0:
            # oversold -> long
            orders.append(Order(side="buy", size=self.size))
            self.position = 1
        elif z >= self.entry_z and self.position >= 0:
            # overbought -> short/flat; here we flatten longs
            orders.append(Order(side="sell", size=self.size))
            self.position = -1
        elif abs(z) < self.exit_z and self.position != 0:
            # revert to flat
            if self.position > 0:
                orders.append(Order(side="sell", size=self.size))
            else:
                orders.append(Order(side="buy", size=self.size))
            self.position = 0
        return orders

    def on_stop(self):
        pass
