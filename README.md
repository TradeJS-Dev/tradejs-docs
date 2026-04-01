# tradejs-docs

Standalone Docusaurus documentation site for the TradeJS framework.

Source of truth for `docs.tradejs.dev`. Core framework code stays in the main monorepo: `https://github.com/TradeJS-Dev/tradejs`.

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

## Production Deploy

The repository can also deploy `docs` on the existing production server through `~/docker-compose.prod.yml`.

Required repository configuration:

- variable: `PROD_DEPLOY_ENABLED=true`
- secrets: `SSH_HOST`, `SSH_USER`, `SSH_KEY`

When enabled, pushes to `main` publish the image and then run:

```bash
docker compose -f ~/docker-compose.prod.yml pull docs
docker compose -f ~/docker-compose.prod.yml up -d docs
```

GHCR package `tradejs-docs` must stay public so the production host can pull it without registry login.
