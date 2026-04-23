import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const currentLocale = process.env.DOCUSAURUS_CURRENT_LOCALE ?? 'en';
const t = (en: string, ru: string) => (currentLocale === 'ru' ? ru : en);

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: t('Getting started', 'Начало'),
      collapsed: false,
      items: [
        'intro',
        'getting-started/quickstart',
        'getting-started/root-user',
        'getting-started/data-sync',
      ],
    },
    {
      type: 'category',
      label: t('Strategies', 'Стратегии'),
      items: [
        {
          type: 'category',
          label: t('Authoring', 'Разработка'),
          items: [
            'api/framework',
            'strategies/authoring/write-strategies',
            {
              type: 'category',
              label: t('Strategy Runtime Hooks', 'Хуки runtime-стратегий'),
              items: [
                'strategies/authoring/strategy-hooks/index',
                'strategies/authoring/strategy-hooks/on-init',
                'strategies/authoring/strategy-hooks/on-bar',
                'strategies/authoring/strategy-hooks/after-core-decision',
                'strategies/authoring/strategy-hooks/after-bar-decision',
                'strategies/authoring/strategy-hooks/on-skip',
                'strategies/authoring/strategy-hooks/before-close-position',
                'strategies/authoring/strategy-hooks/after-enrich-ml',
                'strategies/authoring/strategy-hooks/after-enrich-ai',
                'strategies/authoring/strategy-hooks/before-entry-gate',
                'strategies/authoring/strategy-hooks/before-place-order',
                'strategies/authoring/strategy-hooks/after-place-order',
                'strategies/authoring/strategy-hooks/on-runtime-error',
              ],
            },
            'strategies/authoring/typescript-strategy-step-by-step',
            'strategies/authoring/pine-strategy-step-by-step',
            'strategies/authoring/plugin-e2e',
          ],
        },
        {
          type: 'category',
          label: t('Built-In Strategies', 'Встроенные стратегии'),
          items: [
            'strategies/reference/trendline',
            'strategies/reference/breakout',
            'strategies/reference/ma-strategy',
            'strategies/reference/volume-divergence',
            'strategies/reference/adaptive-momentum-ribbon',
          ],
        },
        {
          type: 'category',
          label: t('Validation and Live Ops', 'Валидация и live-режим'),
          items: [
            'strategies/operations/risk-management',
            'strategies/operations/pre-live-checklist',
            'strategies/operations/debug-live',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: t('Indicators', 'Индикаторы'),
      items: ['indicators/authoring', 'indicators/pine', 'indicators/catalog'],
    },
    {
      type: 'category',
      label: t('Backtesting', 'Бэктестинг'),
      items: [
        {
          type: 'category',
          label: t('Workflow', 'Процесс'),
          items: [
            'runtime/backtesting/overview',
            'runtime/backtesting/grid-config',
            'runtime/backtesting/results-runtime-config',
            'runtime/backtesting/runtime-parity',
          ],
        },
        {
          type: 'category',
          label: t('Playbook', 'Шпаргалка'),
          items: ['runtime/backtesting/strategy-playbook'],
        },
      ],
    },
    {
      type: 'category',
      label: t('Runtime', 'Рантайм'),
      items: [
        {
          type: 'category',
          label: t('Signals', 'Сигналы'),
          items: [
            'runtime/execution/signals',
            'runtime/execution/multi-strategy-signals',
            'runtime/execution/telegram-notifications',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'ML',
      items: [
        'ai-ml/ml/configuration',
        'ai-ml/ml/inspect',
        'ai-ml/ml/train-latest-select',
        'ai-ml/ml/infer-service',
        'ai-ml/ml/feature-engineering-cookbook',
        'ai-ml/ml/model-promotion-policy',
      ],
    },
    {
      type: 'category',
      label: 'AI',
      items: [
        'ai-ml/ai/configuration',
        'ai-ml/ai/prompt-replay',
        'ai-ml/ai/prompt-governance',
      ],
    },
    {
      type: 'category',
      label: t('Operations', 'Эксплуатация'),
      items: [
        'api/cli',
        'operations/env-reference',
        'operations/redis-data-model',
        'operations/timescale-schema',
        'operations/add-exchange-connector',
        'operations/derivatives-ingest',
        'operations/maintenance-cli-scripts',
        'operations/production-runbook',
        'operations/monitoring-alerts',
        'operations/backup-restore',
        'operations/cloud-blueprint',
        'operations/security-hardening',
      ],
    },
  ],
};

export default sidebars;
