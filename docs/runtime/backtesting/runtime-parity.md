---
title: Runtime Parity
---

`runtime-parity` compares live/runtime entry records with a deterministic
backtest replay over the same recent window.

Use it after promoting backtest results into runtime config or after changing
strategy runtime behavior. It answers a narrow question:

> Did the shared runtime and the backtest replay produce comparable entry
> orders for the selected strategies and symbols?

## Run It

```bash
npx @tradejs/cli runtime-parity --user root --connector bybit --days 3
```

Useful variants:

```bash
npx @tradejs/cli runtime-parity --user root --connector bybit --days 3 --details
npx @tradejs/cli runtime-parity --user root --connector bybit --strategy TrendLine --tickers BTC,ETH
npx @tradejs/cli runtime-parity --user root --connector bybit --startTime 1714000000000 --endTime 1714260000000
npx @tradejs/cli runtime-parity --user root --connector bybit --days 3 --notify
```

## What It Replays

The command builds replay targets from:

- saved runtime trade records
- runtime signal/evaluation universe
- explicit `--tickers`
- latest strategy results when available

For each target it resolves the effective runtime config:

- user strategy config from Redis
- per-symbol `results` patch when available
- replay runtime fields such as `ENV`

By default the replay runs with `ENV=BACKTEST`, so it checks core/runtime
execution parity without calling live AI/ML gates.

Use `--runtimeGates` only when you intentionally want parity replay to execute
configured runtime gates. This may call external AI providers and ML inference.

## Matching Rules

Runtime and backtest entries are matched by:

- strategy
- symbol
- direction
- timestamp within the configured tolerance

The default timestamp tolerance is one 15m bar. Change it with:

```bash
npx @tradejs/cli runtime-parity --toleranceBars 2
```

Entry price is reported as drift for diagnostics, but it is not the primary
match key.

## Output

The console and Telegram report include:

- replay window, connector, replay env, runtime-gates status, tolerance
- target counts, compared targets, replay errors, and target sources
- runtime entries, deduped runtime entries, duplicate entries, backtest entries
- matched, runtime-only, and backtest-only counts
- average/max entry price delta and timestamp drift for matched entries
- per-strategy target and entry breakdown
- backtest-only classifications when runtime signals/evaluations explain why an entry did not become a runtime trade
- warnings when AI/ML gates are configured but `--runtimeGates` is not enabled

When `--notify` is used, the same summary is sent to Telegram through the
current user's saved Telegram settings.

## Interpreting Results

`matched` should be close to runtime entries when the replay window has enough
market data and the runtime config matches what was live.

`runtimeOnly` means a runtime trade record exists but the deterministic replay
did not produce a comparable entry.

`backtestOnly` means replay produced an entry that was not found in runtime
trade records. The report classifies these when possible:

- `gated_out` — runtime signal/evaluation existed but AI/ML or policy blocked the trade
- `order_failed` — runtime tried but order placement failed
- `core_skipped` — runtime evaluated but core skipped
- `not_evaluated` — no comparable runtime evaluation was found
- `true_mismatch` — no known runtime-side explanation was found

If a strategy has `runtime=0` and `backtest=0`, the selected targets produced no
comparable entries in that window. It does not mean AI/ML would approve a live
trade every day.

## Flags

- `--user` selects the Redis user config and runtime journal.
- `--connector` selects the connector provider/name for replay.
- `--days` sets a recent replay window.
- `--startTime` and `--endTime` set an explicit replay window.
- `--strategy` limits replay to one strategy.
- `--tickers` replays comma-separated symbols for all configured strategies.
- `--cacheOnly` skips market history refresh before replay.
- `--toleranceBars` changes timestamp matching tolerance.
- `--runtimeGates` enables configured runtime AI/ML gates during replay.
- `--details` prints unmatched entry details to stdout.
- `--notify` sends the parity summary to Telegram.
