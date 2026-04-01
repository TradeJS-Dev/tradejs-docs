# AGENTS.md

## Scope

These rules apply to the `tradejs-docs` repository.

## Purpose

This repository is the source of truth for `docs.tradejs.dev`.
Keep the docs standalone, buildable with plain `npm`, and deployable through its own GitHub Actions workflow.

## Audience

- This repo is for external package users.
- Do not document monorepo-only workflows here unless they are explicitly presented as internal-only and clearly labeled.
- Prefer package install flows, public subpath imports, and public URLs.

## Build Rules

- Use `npm install` and `npm run build`.
- Keep both locales buildable.
- Keep the app runnable with the local `Dockerfile`.
- Treat `ghcr.io/tradejs-dev/tradejs-docs` as the canonical image name.
- If changing deploy automation, keep the production compose service name as `docs`.

## Deploy Rules

- Production deploy is gated by repository variable `PROD_DEPLOY_ENABLED`.
- Required secrets are `SSH_HOST`, `SSH_USER`, and `SSH_KEY`.
- The workflow should refresh only the `docs` service on the target host unless explicitly changing infra ownership.

## Editing Policy

- Keep changes focused.
- Preserve stable public URLs whenever possible.
- Do not reintroduce monorepo-only commands like `yarn workspace @tradejs/docs ...` into the README or workflow examples.
