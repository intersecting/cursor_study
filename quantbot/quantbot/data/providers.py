from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Protocol, Optional

import pandas as pd
import time

try:
    from yfinance.exceptions import YFRateLimitError
except Exception:  # pragma: no cover
    YFRateLimitError = Exception


@dataclass
class Bar:
    ts: pd.Timestamp
    open: float
    high: float
    low: float
    close: float
    volume: float


class DataProvider(Protocol):
    def fetch_history(
        self, symbol: str, start: Optional[str], end: Optional[str], interval: str
    ) -> pd.DataFrame:
        """Return dataframe indexed by datetime with columns: open, high, low, close, volume."""


class YahooProvider:
    """Simple wrapper around yfinance. Replace with your vendor of choice."""

    def __init__(self) -> None:
        try:
            import yfinance as yf  # type: ignore
        except ImportError as exc:
            raise RuntimeError(
                "yfinance not installed. Install via `pip install yfinance`."
            ) from exc
        self._yf = yf

    def fetch_history(
        self, symbol: str, start: Optional[str], end: Optional[str], interval: str
    ) -> pd.DataFrame:
        ticker = self._yf.Ticker(symbol)
        df = self._fetch_with_retry(ticker, start, end, interval)
        if df.empty:
            raise ValueError(f"No data returned for {symbol} {interval}.")
        df = df.rename(
            columns={
                "Open": "open",
                "High": "high",
                "Low": "low",
                "Close": "close",
                "Volume": "volume",
            }
        )
        df.index = pd.to_datetime(df.index)
        return df[["open", "high", "low", "close", "volume"]]

    def _fetch_with_retry(
        self, ticker, start: Optional[str], end: Optional[str], interval: str, retries: int = 3, backoff: float = 2.0
    ) -> pd.DataFrame:
        for attempt in range(retries):
            try:
                return ticker.history(start=start, end=end, interval=interval)
            except YFRateLimitError:
                if attempt == retries - 1:
                    raise
                time.sleep(backoff * (attempt + 1))
        return ticker.history(start=start, end=end, interval=interval)


class TushareProvider:
    """Tushare provider for CN equities. Requires env `TUSHARE_TOKEN`."""

    def __init__(self) -> None:
        token = os.getenv("TUSHARE_TOKEN")
        if not token:
            raise RuntimeError("Set env TUSHARE_TOKEN for Tushare access.")
        try:
            import tushare as ts  # type: ignore
        except ImportError as exc:
            raise RuntimeError(
                "tushare not installed. Install via `pip install tushare`."
            ) from exc
        self._ts = ts
        self._token = token
        self._ts.set_token(token)
        self.pro = ts.pro_api(token)

    def fetch_history(
        self, symbol: str, start: Optional[str], end: Optional[str], interval: str
    ) -> pd.DataFrame:
        freq_map = {
            "1d": "D",
            "1w": "W",
            "1m": "M",
            "60m": "60min",
            "30m": "30min",
            "15m": "15min",
            "5m": "5min",
            "1m": "1min",
        }
        freq = freq_map.get(interval, "D")
        df = self._ts.pro_bar(
            ts_code=symbol,
            start_date=start.replace("-", "") if start else None,
            end_date=end.replace("-", "") if end else None,
            adj="qfq",
            freq=freq,
            api=self.pro,
        )
        if df is None or df.empty:
            raise ValueError(f"No data returned for {symbol} {interval}.")
        df["trade_date"] = pd.to_datetime(df["trade_date"])
        df = df.sort_values("trade_date").set_index("trade_date")
        df = df.rename(
            columns={
                "open": "open",
                "high": "high",
                "low": "low",
                "close": "close",
                "vol": "volume",
            }
        )
        return df[["open", "high", "low", "close", "volume"]]


def get_provider(name: str) -> DataProvider:
    name = name.lower()
    if name == "yahoo":
        return YahooProvider()
    if name == "tushare":
        return TushareProvider()
    raise ValueError(f"Unknown provider: {name}")
