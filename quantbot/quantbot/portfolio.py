from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict

from .strategy import Order


@dataclass
class Position:
    size: float = 0.0
    avg_price: float = 0.0

    def market_value(self, price: float) -> float:
        return self.size * price


@dataclass
class Portfolio:
    cash: float = 100_000.0
    positions: Dict[str, Position] = field(default_factory=dict)
    equity_curve: list = field(default_factory=list)

    def value(self, price_lookup) -> float:
        total = self.cash
        for symbol, pos in self.positions.items():
            total += pos.market_value(price_lookup(symbol))
        return total

    def process_order(
        self,
        symbol: str,
        order: Order,
        price: float,
        commission_bps: float = 1.0,
        slippage_bps: float = 2.0,
    ) -> None:
        signed_size = order.size if order.side == "buy" else -order.size
        slip = price * (slippage_bps / 10_000) * (1 if signed_size > 0 else -1)
        fill_price = price + slip
        cost = fill_price * signed_size
        commission = abs(fill_price * order.size) * (commission_bps / 10_000)
        self.cash -= cost + commission

        pos = self.positions.setdefault(symbol, Position())
        new_size = pos.size + signed_size
        if new_size == 0:
            pos.size = 0
            pos.avg_price = 0
        else:
            pos.avg_price = (pos.avg_price * pos.size + fill_price * signed_size) / new_size
            pos.size = new_size

    def snapshot(self, price_lookup) -> float:
        equity = self.value(price_lookup)
        self.equity_curve.append(equity)
        return equity
