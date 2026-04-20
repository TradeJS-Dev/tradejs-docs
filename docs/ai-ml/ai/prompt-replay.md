---
title: Prompt Replay from Backtests
---

TradeJS can turn AI-enabled backtests into reusable prompt replay datasets.

Instead of treating AI review as a live-only gate, you can capture replayable AI rows during backtests and run the same historical trades through updated prompt logic later.

This replay is historical, not provider-free. By default, `ai-train` sends prompt requests to the configured AI provider again; only `--localOnly` switches replay into a deterministic local mode without provider calls.

## Why It Matters

- Iterate on prompt behavior without rerunning the full market simulation every time.
- Compare models, providers, and quality thresholds on the same historical sample.
- Measure false accepts and false rejects before changing live AI gating.
- Keep AI evaluation attached to realized trade outcomes, not synthetic examples.

## What TradeJS Records During Backtests

When AI dataset export is enabled in backtests, TradeJS writes per-trade rows with:

- signal identity, symbol, direction, and timestamp
- strategy name
- structured AI payload used to rebuild strategy prompts later
- realized trade profit for historical scoring
- optional test metadata for backtest traceability

Rows are written into per-worker chunk files and later merged into one replay dataset.

## How Prompt Replay Works

1. Run a backtest with AI dataset export enabled.
2. Merge worker chunk files into one timestamped dataset.
3. Replay that dataset through the current AI prompt logic.
4. Compare approval decisions against realized outcomes before changing live gating.

During replay, TradeJS rebuilds the strategy prompt pair from the saved signal and payload context, so prompt and adapter changes can be evaluated on the same historical sample.

## Reproducible CLI Flow

```bash
npx @tradejs/cli backtest --config TrendLine:base --ai
npx @tradejs/cli ai-export
npx @tradejs/cli ai-train -n 50 --minQuality 4
```

Artifacts:

- `backtest --ai` writes `data/ai/export/ai-dataset-<strategy>-chunk-<chunkId>.jsonl`
- `ai-export` merges them into `data/ai/export/ai-dataset-<strategy>-merged-<timestamp>.jsonl`
- `ai-train` replays rows from the latest merged file by default

Important:

- default replay still calls your configured AI provider
- `--localOnly` is the provider-free deterministic gate mode

## What You Can Validate

- prompt changes in strategy `aiAdapter`
- provider or model changes
- `minQuality` threshold tuning
- agreement with the original strategy direction
- `tp / fp / tn / fn` behavior for approval vs realized profitability
- deterministic local gate experiments with `--localOnly`

## Why This Is Useful Before Live Rollout

Prompt replay gives you a safer iteration loop:

1. Change prompt logic or adapter rules in code.
2. Replay the same historical rows.
3. Check whether approval coverage and realized quality improve.
4. Promote the new gate only after the tradeoff is defensible.

That makes AI gating auditable, repeatable, and easier to discuss with strategy authors than ad-hoc prompt testing.

## See Also

- [AI Runtime and Configuration](./configuration)
- [AI Prompt Governance](./prompt-governance)
- [Historical Evaluation for AI Gating](./offline-gating-eval)
