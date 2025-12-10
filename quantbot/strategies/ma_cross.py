from __future__ import annotations

import pandas as pd

from quantbot.strategy import Order, Strategy
from quantbot.data.providers import Bar


class MovingAverageCross(Strategy):
    def __init__(self, symbol: str, params: dict):
        self.symbol = symbol
        self.fast = int(params.get("fast", 5))
        self.slow = int(params.get("slow", 20))
        self.position = 0

    def on_start(self, history):
        pass

    def on_bar(self, bar: Bar, history):
        prices = pd.Series([b.close for b in history] + [bar.close])
        if len(prices) < self.slow:
            return []
        fast_ma = prices.rolling(self.fast).mean().iloc[-1]
        slow_ma = prices.rolling(self.slow).mean().iloc[-1]

        orders = []
        if fast_ma > slow_ma and self.position <= 0:
            orders.append(Order(side="buy", size=100))
            self.position = 1
        elif fast_ma < slow_ma and self.position >= 0:
            orders.append(Order(side="sell", size=100))
            self.position = -1
        return orders

    def on_stop(self):
        pass
