from __future__ import annotations

import logging
from typing import Protocol

from .strategy import Order

logger = logging.getLogger(__name__)


class Broker(Protocol):
    def place_order(self, symbol: str, order: Order) -> str:
        ...


class DummyBroker:
    """Placeholder broker for local dry-run."""

    def place_order(self, symbol: str, order: Order) -> str:
        logger.info("Placing %s %s at market", order.side, order.size)
        return "dummy-order-id"


class LiveTrader:
    def __init__(self, broker: Broker):
        self.broker = broker

    def execute(self, symbol: str, orders: list[Order]) -> list[str]:
        ids = []
        for order in orders:
            order_id = self.broker.place_order(symbol, order)
            ids.append(order_id)
        return ids
