---
sidebar_position: 6
title: CLI API
---

TradeJS command-line interface is exposed as the `@tradejs/cli` package.
Use it directly after package install via `npx @tradejs/cli <command>`.

## Core Commands

```bash
npx @tradejs/cli doctor
npx @tradejs/cli infra-init
npx @tradejs/cli infra-up
npx @tradejs/cli infra-down
npx @tradejs/cli backtest
npx @tradejs/cli signals
npx @tradejs/cli signals-summary
npx @tradejs/cli runtime-parity
npx @tradejs/cli bot
npx @tradejs/cli results
```

## ML Commands

```bash
npx @tradejs/cli ml-export
npx @tradejs/cli ml-inspect
npx @tradejs/cli ml-train:latest
npx @tradejs/cli ml-train:trendline:xgboost
```

## AI Commands

```bash
npx @tradejs/cli ai-export
npx @tradejs/cli ai-train -n 50 --minQuality 4
```

## Backtest Flags

`npx @tradejs/cli backtest --help` supports key flags:

- `-c, --config` backtest config key (default: `breakout`)
- `-t, --tickers` custom symbol list
- `-e, --exclude` exclude symbols
- `-n, --tests` max tests
- `-p, --parallel` worker count
- `-u, --updateOnly` update market cache only
- `-C, --cacheOnly` do not refresh market cache
- `-m, --ml` write ML rows to dataset chunks
- `-A, --ai` write AI prompt rows to dataset chunks

## AI Train Flags

`npx @tradejs/cli ai-train --help`:

- `-n, --recent` evaluate the latest N trades from the end (`0` = all rows)
- `--minQuality` minimum AI quality threshold for approval
- `-s, --strategy` select latest merged dataset for one strategy
- `-f, --file` evaluate an explicit merged dataset file

## Signals Flags

`npx @tradejs/cli signals --help`:

- `-t, --tickers`
- `-e, --exclude`
- `-m, --makeOrders`
- `-N, --notify` send Telegram notifications
- `-u, --updateOnly`
- `-C, --cacheOnly`
- `-c, --chunk` chunk mode like `1/3`

## Signals Summary Flags

`npx @tradejs/cli signals-summary --help`:

- `-u, --user` select the Redis user that owns Telegram settings and runtime journal data
- `--connector` choose the connector used for trade reconciliation
- `-H, --hours` size of the digest window in hours (`24` by default)
- `-P, --printOnly` print the digest instead of sending it to Telegram

## Runtime Parity Flags

`npx @tradejs/cli runtime-parity --help`:

- `-u, --user` select the Redis user config and runtime journal
- `-o, --connector` connector provider/name for parity replay
- `-d, --days` recent replay window in days
- `--startTime` and `--endTime` explicit replay window timestamps
- `-s, --strategy` compare one strategy only
- `-t, --tickers` replay comma-separated symbols for configured strategies
- `-C, --cacheOnly` do not refresh market history before replay
- `--toleranceBars` allowed entry timestamp drift in bars
- `--runtimeGates` replay with configured runtime AI/ML gates enabled
- `-D, --details` print unmatched entry details
- `-N, --notify` send the parity summary to Telegram

## Doctor Flags

`npx @tradejs/cli doctor --help`:

- `--require-ml` make ML gRPC check mandatory
- `--skip-ml` skip ML gRPC check

## Deep Dives

- [Grid config for backtests](../runtime/backtesting/grid-config) - how to define Redis grid configs for mass parameter search
- [Results and runtime promotion](../runtime/backtesting/results-runtime-config) - promoting backtest configs with `@tradejs/cli results`, `isConfigFromBacktest`
- [Runtime Parity](../runtime/backtesting/runtime-parity) - comparing runtime entry records with deterministic backtest replay
- [Data Sync](../getting-started/data-sync) - data refresh via `continuity` and `backtest --updateOnly`
