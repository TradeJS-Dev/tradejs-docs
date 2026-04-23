---
title: Runtime parity
---

`runtime-parity` сравнивает live/runtime записи входов с детерминированным
backtest replay за тот же недавний период.

Запускайте его после promotion результатов бэктеста в runtime config или после
изменений в runtime-логике стратегии. Команда отвечает на узкий вопрос:

> Сгенерировали ли shared runtime и backtest replay сопоставимые entry orders
> для выбранных стратегий и символов?

## Запуск

```bash
npx @tradejs/cli runtime-parity --user root --connector bybit --days 3
```

Полезные варианты:

```bash
npx @tradejs/cli runtime-parity --user root --connector bybit --days 3 --details
npx @tradejs/cli runtime-parity --user root --connector bybit --strategy TrendLine --tickers BTC,ETH
npx @tradejs/cli runtime-parity --user root --connector bybit --startTime 1714000000000 --endTime 1714260000000
npx @tradejs/cli runtime-parity --user root --connector bybit --days 3 --notify
```

## Что replay’ится

Команда строит replay targets из:

- сохраненных runtime trade records
- runtime signal/evaluation universe
- явных `--tickers`
- последних strategy results, если они доступны

Для каждого target резолвится effective runtime config:

- user strategy config из Redis
- per-symbol `results` patch, если он есть
- runtime поля replay, например `ENV`

По умолчанию replay запускается с `ENV=BACKTEST`, поэтому проверяет parity
core/runtime исполнения без вызова live AI/ML gates.

Используйте `--runtimeGates` только если намеренно хотите запускать
сконфигурированные runtime gates во время parity replay. Это может вызвать
внешних AI providers и ML inference.

## Правила matching

Runtime и backtest entries сопоставляются по:

- strategy
- symbol
- direction
- timestamp в пределах заданного tolerance

Дефолтный tolerance по timestamp — одна 15m свеча. Изменить его можно так:

```bash
npx @tradejs/cli runtime-parity --toleranceBars 2
```

Entry price выводится как drift для диагностики, но не является основным ключом
matching.

## Output

Console и Telegram report включают:

- окно replay, connector, replay env, статус runtime gates и tolerance
- количество targets, compared targets, replay errors и sources targets
- runtime entries, deduped runtime entries, duplicates, backtest entries
- matched, runtime-only и backtest-only counts
- average/max entry price delta и timestamp drift для matched entries
- per-strategy breakdown по targets и entries
- классификации backtest-only, если runtime signals/evaluations объясняют, почему entry не стал runtime trade
- warnings, если AI/ML gates сконфигурированы, но `--runtimeGates` не включен

При `--notify` та же сводка отправляется в Telegram через сохраненные настройки
текущего пользователя.

## Как читать результаты

`matched` должен быть близок к runtime entries, если в окне достаточно market
data и runtime config совпадает с тем, что было live.

`runtimeOnly` означает, что runtime trade record есть, но детерминированный
replay не создал сопоставимый entry.

`backtestOnly` означает, что replay создал entry, которого нет в runtime trade
records. Report по возможности классифицирует такие случаи:

- `gated_out` — runtime signal/evaluation был, но AI/ML или policy заблокировали сделку
- `order_failed` — runtime пытался поставить ордер, но placement failed
- `core_skipped` — runtime выполнился, но core вернул skip
- `not_evaluated` — сопоставимой runtime evaluation не найдено
- `true_mismatch` — известного runtime-объяснения нет

Если у стратегии `runtime=0` и `backtest=0`, выбранные targets не дали
сопоставимых entries в этом окне. Это не означает, что AI/ML обязан одобрять
live trade каждый день.

## Флаги

- `--user` выбирает Redis user config и runtime journal.
- `--connector` выбирает connector provider/name для replay.
- `--days` задает недавнее окно replay.
- `--startTime` и `--endTime` задают явное окно replay.
- `--strategy` ограничивает replay одной стратегией.
- `--tickers` replay’ит comma-separated symbols для всех configured strategies.
- `--cacheOnly` пропускает обновление market history перед replay.
- `--toleranceBars` меняет timestamp matching tolerance.
- `--runtimeGates` включает configured runtime AI/ML gates во время replay.
- `--details` печатает детали unmatched entries в stdout.
- `--notify` отправляет parity summary в Telegram.
