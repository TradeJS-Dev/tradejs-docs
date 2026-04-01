# tradejs-docs

Standalone Docusaurus documentation site for the TradeJS framework.

## Install

```bash
npm install
```

## Run

Build and serve both locales:

```bash
npm run dev
```

Site runs on `http://localhost:3001`.

## Hot Reload

Docusaurus dev server supports one locale per process.

```bash
npm run dev:hot:en
npm run dev:hot:ru
```

## Build

```bash
npm run build
```

## Container Image

Pushes to `main` publish `ghcr.io/tradejs-dev/tradejs-docs`.
