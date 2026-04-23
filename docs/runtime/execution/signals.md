---
sidebar_position: 9
title: How Signals Work
---

## Entry Point

```bash
npx @tradejs/cli signals
```

Main script:

- `@tradejs/cli`

## Real Strategy Config Source

Signal runtime loads active strategy configs from Redis keys like:

- `users:<user>:strategies:TrendLine:config`

And resolves creators dynamically:

```ts
const strategyCreator = await getStrategyCreator(strategyName);
const strategy = await strategyCreator({
  userName: flags.user,
  connector,
  symbol,
  data: [...cachedData],
  btcData: [...btcCachedData],
  btcBinanceData: [...btcBinanceData],
  btcCoinbaseData: [...btcCoinbaseData],
  config: {
    ...strategyConfig,
    ENV: 'CRON',
    INTERVAL: interval,
    MAKE_ORDERS: flags.makeOrders,
  },
});
```

## Pipeline

1. Resolve connector and ticker universe.
2. Optionally warm market cache with `update`.
3. Load active strategy configs from Redis.
4. Run project-level `beforeSignals` hooks from `tradejs.config.ts`.
5. Run strategy runtime for each symbol.
6. Save produced signals to Redis.
7. Run project-level `afterSignals` hooks from `tradejs.config.ts`.
8. Optionally send screenshots and Telegram notifications.

`beforeSignals` and `afterSignals` are batch hooks for the whole signals run. They are not strategy manifest hooks and do not execute per candle.

Typical use cases:

- one-shot global risk checks before scanning symbols
- cross-strategy close-all logic that should run once per signals cycle
- run-level logging, metrics, or notifications after signals finish

`beforeSignals` may abort the ticker evaluation phase by returning:

```ts
{
  abort: true,
  reason: 'SOME_REASON',
}
```

When active strategy runtime calls `strategyApi.getMarketData()` in `ENV='CRON'`, TradeJS reuses the warmed candle cache for the current run instead of forcing another live kline fetch for every strategy symbol.

## Order Execution

- Enable with `--makeOrders`.
- Runtime can still skip orders due to AI/ML policy.
- Signal can be stored with `orderStatus = skipped` when gate blocks execution.
- Signals stored as `skipped` or `canceled` are not forwarded to Telegram notifications.

## Telegram Notifications

```bash
npx @tradejs/cli signals --notify
```

When AI analysis is present, Telegram receives a follow-up analysis message.
TradeJS also provides `npx @tradejs/cli signals-summary` for a daily Telegram digest over recent runtime signal and trade activity.
The same Telegram report delivery helper is used by `runtime-parity --notify`
for runtime/backtest parity summaries.

See full setup:

- [Telegram Notifications](./telegram-notifications)
- [Runtime Parity](../backtesting/runtime-parity)
