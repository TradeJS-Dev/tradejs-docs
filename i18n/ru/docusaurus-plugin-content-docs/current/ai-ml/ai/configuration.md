---
sidebar_position: 11
title: Как работает и настраивается ИИ
---

AI в TradeJS — это runtime-слой дополнительной проверки сигнала перед исполнением ордера.

## Runtime-модуль

- `@tradejs/node`

## Откуда берется конфигурация

TradeJS ищет AI credentials в таком порядке:

1. Настройки аккаунта в Redis-записи текущего пользователя.

В web UI откройте drawer настроек аккаунта через шестеренку в левом сайдбаре и задайте:

- `OPENAI_API_KEY`
- `OPENAI_API_ENDPOINT`

Эти значения хранятся на уровне пользователя, поэтому разные операторы могут использовать разные ключи или провайдеры без общего глобального секрета.

## Поведение runtime

Для `entry` с сигналом:

1. Runtime строит AI payload.
2. Сохраняет анализ в Redis (`analysis:<symbol>:<signalId>`).
3. В non-backtest режиме может заблокировать ордер по quality threshold.

Порог по умолчанию: `4`.

Примечания:

- `OPENAI_API_KEY` и `OPENAI_API_ENDPOINT` должны задаваться в записи пользователя, а не в app environment variables.
- Если нужен стандартный OpenAI endpoint, сохраните `https://api.openai.com/v1` в настройках пользователя явно.

Если нужно проверить изменения AI-фильтра до выхода в рабочий режим, см. [Проверка AI-фильтра на данных бэктестов](./prompt-replay). Этот сценарий использует AI-датасет, выгруженный из бэктеста, чтобы прогнать текущую логику промптов на том же историческом наборе сделок.

## `AI_MODE`

Используйте `AI_MODE`, чтобы выбрать, какой AI decision path управляет live-апрувом ордера при `AI_ENABLED=true`.

- `AI_MODE=llm` — runtime отправляет payload в настроенный AI provider и использует ответ модели для quality gate.
- `AI_MODE=gate` — runtime использует локальный deterministic strategy gate для апрува, при этом AI analysis records все равно сохраняются для последующего разбора и сравнения.

`MIN_AI_QUALITY` остается общим порогом в обоих режимах.

Практически это означает:

- `AI_MODE=gate` ближе всего к `ai-train --localOnly`, потому что оба режима используют одну и ту же локальную deterministic approval logic.
- `AI_MODE=llm` нужно валидировать обычным `ai-train` или live/runtime records, потому что ответ провайдера может отличаться от локального gate.

Пример:

```json
{
  "AI_ENABLED": true,
  "AI_MODE": "gate",
  "MIN_AI_QUALITY": 4
}
```

## Пример TrendLine adapter

TrendLine расширяет общий payload полем `trendline` без trim:

```ts
export const trendLineAiAdapter: StrategyAiAdapter = {
  buildPayload: ({ signal, basePayload }) => ({
    ...basePayload,
    figures: {
      ...basePayload.figures,
      trendline: signal.figures?.trendLine ?? null,
    },
  }),
  mapEntryRuntimeFromConfig: (config) =>
    mapAiRuntimeFromConfig(
      config as Pick<TrendLineConfig, 'AI_ENABLED' | 'MIN_AI_QUALITY'>,
    ),
};
```

## Как подменить промпт для своей стратегии

Используйте `aiAdapter` в manifest вашей стратегии.
Runtime сохраняет базовый prompt и добавляет ваши add-on блоки.

```ts
import type { StrategyAiAdapter } from '@tradejs/types';

export const myStrategyAiAdapter: StrategyAiAdapter = {
  buildSystemPromptAddon: ({ signal }) => `
Дополнительные правила для ${signal.strategy}:
- Делай акцент на подтверждении пробоя + согласовании с объемом.
- Если подтверждения по объему нет, снижай quality до <= 3.
`,
  buildHumanPromptAddon: ({ signal }) => `
Дополнительный контекст:
- riskRatio=${signal.prices.riskRatio}
- symbol=${signal.symbol}
`,
};
```

Затем подключите adapter в manifest:

```ts
import type { StrategyManifest } from '@tradejs/types';
import { myStrategyAiAdapter } from './adapters/ai';

export const myStrategyManifest: StrategyManifest = {
  name: 'MyStrategy',
  aiAdapter: myStrategyAiAdapter,
};
```

Важно:

- это публичный способ кастомизировать поведение prompt для конкретной стратегии
- базовый runtime-prompt все равно применяется; ваши add-on просто дописываются в system/human prompt

## Реальный паттерн gate-логики

```ts
const minAiQuality = runtime.ai?.minQuality ?? 4;
const shouldMakeOrder =
  makeOrdersEnabled &&
  (!signal || env === 'BACKTEST' || quality == null || quality >= minAiQuality);
```

Если gate не пройден, сигнал сохраняется, но ордер не отправляется.

## AI + ML в одном runtime

- ML добавляет вероятности/метаданные.
- AI оценивает качество сетапа и может заблокировать исполнение.
