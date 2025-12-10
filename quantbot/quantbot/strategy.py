from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Protocol

from .data.providers import Bar


@dataclass
class Order:
    side: str  # "buy" or "sell"
    size: float  # number of shares
    price: Optional[float] = None  # market if None


class Strategy(Protocol):
    symbol: str

    def on_start(self, history: List[Bar]) -> None:
        ...

    def on_bar(self, bar: Bar, history: List[Bar]) -> List[Order]:
        ...

    def on_stop(self) -> None:
        ...
