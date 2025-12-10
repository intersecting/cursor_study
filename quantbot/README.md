# Quant Trading Bot Skeleton (Stocks, Python)

最小可用版，包含：数据接口（默认 yfinance）、策略接口、回测器、风控（仓位+回撤熔断）、示例均线策略、实时执行占位（DummyBroker）。

## 快速开始
```bash
cd quantbot
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. python -m quantbot.examples.run_backtest
```

## 目录
- `quantbot/config.py`：全局配置（数据、策略、风控、回测、实时）。
- `quantbot/data/providers.py`：数据提供者接口，内置 `YahooProvider`（yfinance）与 `TushareProvider`。
- `quantbot/portfolio.py`：持仓、资金与成交处理（含滑点/手续费）。
- `quantbot/strategy.py`：策略协议；示例策略：
  - `strategies/ma_cross.py`：均线交叉
  - `strategies/momentum.py`：动量
  - `strategies/mean_reversion.py`：均值回归
  - `strategies/donchian_breakout.py`：唐奇安通道突破
- `quantbot/backtester.py`：bar 驱动回测，统计收益、最大回撤、Sharpe。
- `quantbot/execution.py`：实时执行占位，可替换为券商/交易所 SDK。
- `examples/run_backtest.py`：运行单标的示例回测
- `examples/rank_symbols.py`：批量回测并按收益排序，可输出柱状图

## 替换数据源（第三方）
- 内置：
  - `yahoo`：需联网，可能会被限流。配置 `provider="yahoo"`.
  - `tushare`：A 股，需 `pip install tushare` 且导出 `TUSHARE_TOKEN=你的token`，symbol 形如 `000001.SZ`，配置 `provider="tushare"`。
- 其他数据源（券商 REST/WS）：在 `quantbot/data/providers.py` 添加 Provider 并在 `get_provider()` 注册。

## 自定义策略
创建新的策略类，实现 `on_bar(bar, history)`，返回 `Order` 列表：
```python
class MyStrategy(Strategy):
    def __init__(self, symbol, params):
        self.symbol = symbol
        self.params = params
        self.position = 0

    def on_bar(self, bar, history):
        # 例如简单突破
        if bar.close > bar.high * 0.99 and self.position <= 0:
            self.position = 1
            return [Order(side="buy", size=100)]
        return []
```
在 `examples/run_backtest.py` 替换 `strategy_factory` 即可。

## 风控与执行
- 风控：`max_position_pct` 控制单标的最大仓位；`daily_stop_pct` 控制回撤熔断。
- 滑点与手续费：在 `BacktestConfig` 里用基点（bps）配置。
- 实时：在 `execution.py` 里用真实 Broker SDK 替换 `DummyBroker`，然后调用 `LiveTrader.execute(symbol, orders)`。

## 下一步可增强
- 支持多标的、多周期
- tick 级回测与撮合
- 绩效报告（分解 alpha/beta、因子暴露）
- Web/CLI 监控与告警
