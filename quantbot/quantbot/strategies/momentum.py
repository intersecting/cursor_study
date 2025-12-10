from __future__ import annotations

import pandas as pd

from quantbot.strategy import Order, Strategy
from quantbot.data.providers import Bar


class Momentum(Strategy):
    """Simple momentum on close-to-close returns."""

    def __init__(self, symbol: str, params: dict):
        self.symbol = symbol
        self.lookback = int(params.get("lookback", 20))
        self.position = 0
        self.size = float(params.get("size", 100))

    def on_start(self, history):
        pass

    def on_bar(self, bar: Bar, history):
        closes = pd.Series([b.close for b in history] + [bar.close])
        if len(closes) <= self.lookback:
            return []
        ret = closes.pct_change(self.lookback).iloc[-1]
        orders = []
        # enter long on positive momentum, flat otherwise
        if ret > 0 and self.position <= 0:
            orders.append(Order(side="buy", size=self.size))
            self.position = 1
        elif ret <= 0 and self.position > 0:
            orders.append(Order(side="sell", size=self.size))
            self.position = 0
        return orders

    def on_stop(self):
        pass
