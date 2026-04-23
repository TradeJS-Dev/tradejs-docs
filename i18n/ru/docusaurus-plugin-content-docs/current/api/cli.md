---
sidebar_position: 6
title: CLI API
---

CLI в TradeJS предоставляется пакетом `@tradejs/cli`.
Рекомендуемый запуск после установки пакета: `npx @tradejs/cli <command>`.

Ниже — команды, которые вы будете использовать чаще всего.

## Основные команды

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

## ML-команды

```bash
npx @tradejs/cli ml-export
npx @tradejs/cli ml-inspect
npx @tradejs/cli ml-train:latest
npx @tradejs/cli ml-train:trendline:xgboost
```

## AI-команды

```bash
npx @tradejs/cli ai-export
npx @tradejs/cli ai-train -n 50 --minQuality 4
```

## Часто используемые флаги `backtest`

`npx @tradejs/cli backtest --help`:

- `-c, --config` — ключ конфигурации бэктеста (по умолчанию `breakout`)
- `-t, --tickers` — список символов
- `-e, --exclude` — исключить символы
- `-n, --tests` — ограничить число тестов
- `-p, --parallel` — число параллельных воркеров
- `-u, --updateOnly` — только обновить кэш рынка
- `-C, --cacheOnly` — не обновлять кэш рынка
- `-m, --ml` — писать ML-строки в chunk-файлы
- `-A, --ai` — писать AI prompt-строки в chunk-файлы

## Флаги `ai-train`

`npx @tradejs/cli ai-train --help`:

- `-n, --recent` — проверить последние N сделок с конца (`0` = все строки)
- `--minQuality` — минимальный quality threshold для AI approval
- `-s, --strategy` — выбрать последний merged dataset для конкретной стратегии
- `-f, --file` — указать конкретный merged dataset файл

## Часто используемые флаги `signals`

`npx @tradejs/cli signals --help`:

- `-t, --tickers`
- `-e, --exclude`
- `-m, --makeOrders`
- `-N, --notify` — отправить уведомления в Telegram
- `-u, --updateOnly`
- `-C, --cacheOnly`
- `-c, --chunk` — запуск по чанку, например `1/3`

## Часто используемые флаги `signals-summary`

`npx @tradejs/cli signals-summary --help`:

- `-u, --user` — выбрать Redis-пользователя, на котором лежат Telegram-настройки и runtime journal
- `--connector` — выбрать connector для сверки сделок
- `-H, --hours` — размер окна сводки в часах (по умолчанию `24`)
- `-P, --printOnly` — печатать сводку в stdout вместо отправки в Telegram

## Часто используемые флаги `runtime-parity`

`npx @tradejs/cli runtime-parity --help`:

- `-u, --user` — выбрать Redis user config и runtime journal
- `-o, --connector` — connector provider/name для parity replay
- `-d, --days` — недавнее окно replay в днях
- `--startTime` и `--endTime` — явные timestamp границы replay
- `-s, --strategy` — сравнить только одну стратегию
- `-t, --tickers` — replay comma-separated symbols для configured strategies
- `-C, --cacheOnly` — не обновлять market history перед replay
- `--toleranceBars` — допустимый timestamp drift entry в барах
- `--runtimeGates` — replay со включенными runtime AI/ML gates
- `-D, --details` — печатать детали unmatched entries
- `-N, --notify` — отправить parity summary в Telegram

## Флаги `doctor`

`npx @tradejs/cli doctor --help`:

- `--require-ml` — сделать проверку ML gRPC обязательной
- `--skip-ml` — пропустить проверку ML gRPC

## Подробные статьи

- [Grid-конфиги бэктестов](../runtime/backtesting/grid-config) — как задавать Redis grid-конфиги для массового перебора параметров
- [Results и promotion в runtime](../runtime/backtesting/results-runtime-config) — promotion конфигов из бэктестов, `@tradejs/cli results`, `isConfigFromBacktest`
- [Runtime parity](../runtime/backtesting/runtime-parity) — сравнение runtime entry records с детерминированным backtest replay
- [Data Sync](../getting-started/data-sync) — обновление данных через `continuity` и `backtest --updateOnly`
