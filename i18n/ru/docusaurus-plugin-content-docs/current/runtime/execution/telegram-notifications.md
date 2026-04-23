---
title: Telegram-уведомления
---

TradeJS умеет отправлять в Telegram runtime-сигналы и суточную сводку.

## 1. Настройте Telegram

Предпочтительный путь для пользователей приложения:

1. Войдите в TradeJS.
2. Откройте drawer настроек аккаунта через шестеренку в левом сайдбаре.
3. Сохраните:
   - `TG_BOT_TOKEN`
   - `TG_CHAT_ID`

Эти значения хранятся в Redis-записи текущего пользователя.

`@tradejs/node` / `@tradejs/cli` читают настройки в таком порядке:

- `TG_BOT_TOKEN` из user settings
- `TG_CHAT_ID` из user settings
- `APP_URL` из окружения

Важные моменты:

- TradeJS загружает отрендеренный скриншот в Telegram вместе с подписью сигнала.
- Если `APP_URL` указывает на публичный HTTPS URL, в сообщении также появится кнопка `Dashboard`.
- Если рендер скриншота упал или PNG не появился, TradeJS откатится к обычному текстовому сообщению и не потеряет уведомление.
- `TG_CHAT_ID` в UI показывается как есть; секреты вроде bot token скрыты до явного редактирования.

## 2. Быстрая проверка бота

```bash
curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\":\"${TG_CHAT_ID}\",\"text\":\"TradeJS test message\"}"
```

## 3. Запуск уведомлений из signals

```bash
npx @tradejs/cli signals --user root --notify --tickers BTC --cacheOnly
```

Поток:

1. Скрипт находит сигналы.
2. Сигналы сохраняются в runtime storage даже если runtime выставил `orderStatus=skipped`.
3. В Telegram не отправляются сигналы со статусами `skipped` и `canceled`; они остаются доступными для UI и debugging.
4. Скрипт пытается прочитать AI-анализ из Redis `analysis:<symbol>:<signalId>`.
5. TradeJS отправляет основное сообщение по сигналу и загружает скриншот, если он доступен.
6. Если AI-анализ есть, отправляется второе сообщение с анализом.

Детали доставки:

- Отправка в Telegram сериализована, чтобы основное сообщение и AI follow-up не перемешивались в чате.
- Если попытка открытия ордера завершилась ошибкой, уведомление всё равно может прийти; фильтруются только `skipped` и `canceled`.

Используйте тот же `--user`, на котором сохранены Telegram-настройки в Redis.

## 4. Суточная сводка

```bash
npx @tradejs/cli signals-summary --user root --connector bybit
```

По умолчанию:

- сводка покрывает последние 24 часа
- `--hours` меняет размер окна
- `--printOnly` печатает сводку в stdout вместо отправки в Telegram

Что входит в сводку:

- количество сигналов по стратегиям и статусам
- количество сделок по стратегиям
- разрез по статусам сделок (`active` / `closed`)
- текущий PnL активных сделок
- закрытый PnL закрытых сделок
- per-strategy counts runtime evaluations и skip reasons, если evaluation records существуют

TradeJS связывает runtime-сигналы и сделки через сгенерированный `orderId`.
На Bybit этот же runtime id передается как `orderLinkId`, что позволяет сводке сопоставлять runtime journal с closed-PnL данными биржи.

## 5. Runtime parity reports

`runtime-parity` тоже умеет отправлять Telegram-friendly report:

```bash
npx @tradejs/cli runtime-parity --user root --connector bybit --days 3 --notify
```

В report входят:

- окно replay, connector, replay env, статус runtime gates и matching tolerance
- counts replay targets, compared targets, replay errors и target sources
- counts runtime/backtest/matched/runtime-only/backtest-only entries
- average/max price delta и timestamp drift для matched entries
- per-strategy parity rows
- backtest-only classifications и AI/ML gate warnings, когда они релевантны

Подробно про смысл parity: [Runtime parity](../backtesting/runtime-parity).

## 6. Форматирование и доставка reports

Summary и parity reports отправляются через общий Telegram report helper:

- reports используют Telegram HTML formatting для жирных секций и code-like diagnostics
- длинные reports автоматически делятся на несколько сообщений до лимита Telegram
- части получают префикс `Part N/M`
- inline markup, если он передан, прикрепляется только к последней части

Signal notifications по-прежнему отправляются по одному сигналу, чтобы основное
сообщение оставалось рядом с optional AI follow-up.

## 7. Частые проблемы

- Сообщения не приходят:
  проверьте сохраненные account settings для этого пользователя и что бот добавлен в чат/канал.
- Приходит текст, но без картинки:
  проверьте генерацию скриншотов и возможность отрисовать страницу дашборда, заданную через `APP_URL`.
- Нет второго сообщения с AI:
  проверьте наличие ключа `analysis:<symbol>:<signalId>` в Redis.
- В сводке нет PnL по сделкам:
  проверьте, что сделки открывались через TradeJS runtime и что выбранный connector умеет отдавать данные, нужные для сверки открытых/закрытых сделок.
- Длинный report пришел несколькими сообщениями:
  это ожидаемо; у Telegram есть лимиты размера сообщения, а TradeJS по возможности сохраняет разбиение по строкам.
