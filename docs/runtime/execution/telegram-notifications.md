---
title: Telegram Notifications
---

TradeJS can send runtime signal messages and a daily digest to Telegram.

## 1. Configure Telegram

Preferred setup for app users:

1. Sign in to TradeJS.
2. Open the account settings drawer from the gear icon in the left sidebar.
3. Save:
   - `TG_BOT_TOKEN`
   - `TG_CHAT_ID`

These values are stored in the current Redis user record.

`@tradejs/node` / `@tradejs/cli` resolve settings in this order:

- `TG_BOT_TOKEN` from user settings
- `TG_CHAT_ID` from user settings
- `APP_URL` from environment

Notes:

- TradeJS uploads the rendered screenshot to Telegram with the signal caption.
- If `APP_URL` is a public HTTPS URL, the Telegram message also includes a dashboard button.
- If screenshot rendering fails or the PNG is missing, TradeJS falls back to a text message instead of dropping the notification.
- `TG_CHAT_ID` is not masked in the settings UI; secrets like bot token are masked until you explicitly edit them.

## 2. Quick Bot Check

```bash
curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\":\"${TG_CHAT_ID}\",\"text\":\"TradeJS test message\"}"
```

## 3. Send Notifications from Signals

```bash
npx @tradejs/cli signals --user root --notify --tickers BTC --cacheOnly
```

Flow:

1. Script finds signals.
2. Signal records are still saved even when runtime decides `orderStatus=skipped`.
3. Telegram delivery filters out `skipped` and `canceled` signals; they are stored for UI/debugging but are not sent to chat.
4. Script loads AI analysis from Redis key `analysis:<symbol>:<signalId>` if present.
5. TradeJS sends the main signal message and uploads the screenshot when available.
6. If AI analysis exists, TradeJS sends one follow-up analysis message.

Delivery details:

- Telegram sends are serialized so the main signal message stays grouped with its AI follow-up in chat order.
- Failed order attempts can still produce a Telegram notification; only `skipped` and `canceled` are filtered out.

Use the same `--user` value that owns the Telegram settings in Redis.

## 4. Daily Summary Digest

```bash
npx @tradejs/cli signals-summary --user root --connector bybit
```

Defaults:

- the digest covers the last 24 hours
- `--hours` changes the window size
- `--printOnly` prints the digest to stdout instead of sending it to Telegram

Digest content:

- signal counts by strategy and by status
- trade counts by strategy
- trade status split (`active` / `closed`)
- current PnL for active trades
- closed PnL for closed trades
- per-strategy runtime evaluation counts and skip reasons when evaluation records exist

TradeJS links runtime signals and trades with a generated `orderId`.
On Bybit, the same runtime id is passed through as `orderLinkId`, which lets the digest reconcile runtime trade records with exchange closed-PnL data.

## 5. Runtime Parity Reports

`runtime-parity` can also send a Telegram-friendly report:

```bash
npx @tradejs/cli runtime-parity --user root --connector bybit --days 3 --notify
```

The report includes:

- replay window, connector, replay env, runtime-gates status, and matching tolerance
- replay target counts, compared targets, replay errors, and target sources
- runtime/backtest/matched/runtime-only/backtest-only entry counts
- average/max price delta and timestamp drift for matched entries
- per-strategy parity rows
- backtest-only classifications and AI/ML gate warnings when relevant

For full parity semantics, see [Runtime Parity](../backtesting/runtime-parity).

## 6. Report Formatting and Delivery

Summary and parity reports are sent through the shared Telegram report helper:

- reports use Telegram HTML formatting for bold sections and code-like diagnostics
- long reports are split into multiple messages before hitting Telegram message limits
- split messages are prefixed with `Part N/M`
- inline markup, when provided, is attached only to the last part

Signal notifications are still sent one signal at a time so the main signal
message stays grouped with its optional AI follow-up.

## 7. Common Troubleshooting

- No messages at all:
  check the saved account settings for that user and whether bot is added to chat/channel.
- Message without image:
  check screenshot generation and whether the app can render the dashboard page configured by `APP_URL`.
- Missing AI follow-up:
  check that `analysis:<symbol>:<signalId>` exists in Redis.
- Daily digest misses trade PnL:
  check that runtime orders were opened through TradeJS and that the selected connector supports the closed/open trade data used by the digest.
- Long report is split into several messages:
  this is expected; Telegram has message size limits and TradeJS preserves line boundaries when possible.
