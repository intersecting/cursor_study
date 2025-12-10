from dataclasses import dataclass, field
from typing import Optional


@dataclass
class DataConfig:
    symbol: str
    timeframe: str = "1d"
    start: Optional[str] = None  # ISO date
    end: Optional[str] = None
    provider: str = "yahoo"  # placeholder for other vendors


@dataclass
class StrategyConfig:
    name: str
    params: dict = field(default_factory=dict)


@dataclass
class RiskConfig:
    max_position_pct: float = 0.2
    daily_stop_pct: float = 0.05
    single_trade_stop_pct: float = 0.02


@dataclass
class BacktestConfig:
    initial_cash: float = 100_000.0
    slippage_bps: float = 2.0
    commission_bps: float = 1.0


@dataclass
class LiveConfig:
    paper: bool = True
    account_id: Optional[str] = None
    base_currency: str = "USD"


@dataclass
class AppConfig:
    data: DataConfig
    strategy: StrategyConfig
    risk: RiskConfig = field(default_factory=RiskConfig)
    backtest: BacktestConfig = field(default_factory=BacktestConfig)
    live: LiveConfig = field(default_factory=LiveConfig)
