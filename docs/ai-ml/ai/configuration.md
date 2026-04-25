---
sidebar_position: 11
title: AI Runtime and Configuration
---

## Purpose

AI in TradeJS is a runtime review layer. It evaluates the current strategy signal and can gate order execution in live mode.

Runtime module:

- `@tradejs/node`

## Configuration Source

TradeJS resolves AI credentials in this order:

1. Account settings stored in the current Redis user record.

In the web app, open the gear icon in the left sidebar and set:

- `OPENAI_API_KEY`
- `OPENAI_API_ENDPOINT`

These values are stored per user, so different operators can use different providers or keys without sharing one global secret.

## Runtime Behavior

For `entry` decisions with signal:

1. Runtime builds AI payload.
2. AI analysis is written to Redis (`analysis:<symbol>:<signalId>`).
3. In non-backtest mode, order may be blocked if quality is below threshold.

Default minimum quality: `4`.

Notes:

- `OPENAI_API_KEY` and `OPENAI_API_ENDPOINT` should be configured on the user record, not in app environment variables.
- If you want the standard OpenAI endpoint, save `https://api.openai.com/v1` in the user settings explicitly.

If you want to validate AI filter changes before touching live execution, see [AI Filter Validation on Backtest Data](./prompt-replay). That workflow uses backtest-exported AI rows to replay the current prompt logic on the same historical sample.

## `AI_MODE`

Use `AI_MODE` to choose which AI decision path controls live order approval when `AI_ENABLED=true`.

- `AI_MODE=llm` — runtime sends the payload to the configured AI provider and uses the model result for the quality gate.
- `AI_MODE=gate` — runtime uses the local deterministic strategy gate for approval, while still persisting AI analysis records for later inspection and comparison.

`MIN_AI_QUALITY` is the shared threshold in both modes.

Operationally:

- `AI_MODE=gate` is the closest match to `ai-train --localOnly`, because both use the same local deterministic approval logic.
- `AI_MODE=llm` should be validated with normal `ai-train` runs or live/runtime records, because provider output can differ from the local gate.

Example:

```json
{
  "AI_ENABLED": true,
  "AI_MODE": "gate",
  "MIN_AI_QUALITY": 4
}
```

## Real TrendLine Adapter Example

TrendLine extends shared payload with untrimmed trendline geometry:

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

## How to Override Prompt for Your Strategy

Use strategy `aiAdapter` in your strategy plugin manifest.
Runtime keeps the base prompt and appends your add-ons.

```ts
import type { StrategyAiAdapter } from '@tradejs/types';

export const myStrategyAiAdapter: StrategyAiAdapter = {
  buildSystemPromptAddon: ({ signal }) => `
Additional rules for ${signal.strategy}:
- Focus on breakout confirmation + volume agreement.
- If volume confirmation is missing, reduce quality to <= 3.
`,
  buildHumanPromptAddon: ({ signal }) => `
Extra context:
- riskRatio=${signal.prices.riskRatio}
- symbol=${signal.symbol}
`,
};
```

Then reference it in strategy manifest:

```ts
import type { StrategyManifest } from '@tradejs/types';
import { myStrategyAiAdapter } from './adapters/ai';

export const myStrategyManifest: StrategyManifest = {
  name: 'MyStrategy',
  aiAdapter: myStrategyAiAdapter,
};
```

Notes:

- this is the public way to customize prompt behavior per strategy
- base runtime prompt is still applied; your add-ons are appended to system/human prompts

## Real Runtime Gate Logic Pattern

```ts
const minAiQuality = runtime.ai?.minQuality ?? 4;
const shouldMakeOrder =
  makeOrdersEnabled &&
  (!signal || env === 'BACKTEST' || quality == null || quality >= minAiQuality);
```

If gate blocks order, signal is still returned with skip reason.

## AI + ML Together

AI and ML are independent runtime layers merged by strategy runtime policy:

- ML enriches signal metadata/probabilities.
- AI evaluates setup quality and can block execution.
