---
sidebar_position: 9
title: Как работают сигналы
---

## Точка входа

```bash
npx @tradejs/cli signals
```

Основной скрипт:

- `@tradejs/cli`

## Откуда берутся конфиги стратегий

Сигналы читают конфиги из Redis по ключам вида:

- `users:<user>:strategies:TrendLine:config`

И динамически поднимают creator:

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

## Пайплайн

1. Резолвятся коннектор и universe тикеров.
2. При необходимости прогревается market cache через `update`.
3. Загружаются активные strategy config из Redis.
4. Выполняются project-level hooks `beforeSignals` из `tradejs.config.ts`.
5. Для каждого символа выполняется runtime стратегии.
6. Сигналы сохраняются в Redis.
7. Выполняются project-level hooks `afterSignals` из `tradejs.config.ts`.
8. При необходимости отправляются скриншоты и Telegram-уведомления.

`beforeSignals` и `afterSignals` — это batch hooks для всего прогона signals. Они не относятся к hooks в `manifest.ts` и не выполняются на каждой свече.

Типичные кейсы:

- одноразовые global risk checks до обхода тикеров
- cross-strategy close-all логика, которую нужно запускать один раз на цикл signals
- run-level логирование, метрики и уведомления после завершения прогона

`beforeSignals` может прервать фазу обработки тикеров, если возвращает:

```ts
{
  abort: true,
  reason: 'SOME_REASON',
}
```

Когда strategy runtime вызывает `strategyApi.getMarketData()` в `ENV='CRON'`, TradeJS теперь использует уже прогретый candle cache текущего прогона вместо повторного live `kline` fetch для каждого символа стратегии.

## Исполнение ордеров

- Включается флагом `--makeOrders`.
- Runtime может заблокировать исполнение по AI/ML policy.
- Сигнал может быть сохранен как `skipped`, даже если ордер не отправлен.
- Сигналы со статусами `skipped` и `canceled` не отправляются в Telegram.

## Telegram-уведомления

```bash
npx @tradejs/cli signals --notify
```

Если есть AI-анализ, он уходит отдельным сообщением.
Для суточной Telegram-сводки используйте `npx @tradejs/cli signals-summary`.
Тот же механизм Telegram reports используется командой `runtime-parity --notify`
для runtime/backtest parity summaries.

Подробная инструкция:

- [Telegram Notifications](./telegram-notifications)
- [Runtime parity](../backtesting/runtime-parity)
