# ADR-010 — pnpm JS Workspace Alongside uv Python Workspace

**Status:** Accepted
**Date:** 2026-05

## Context

The repo was a pure Python `uv` workspace (`pyproject.toml` at root). Adding `apps/web` (Next.js) and a shared `packages/kosmos-design/` design-system package required a JS dependency manager. Options were: (a) treat `apps/web` as a standalone Node project with no JS workspace, (b) add a root-level JS workspace using npm, yarn, pnpm, or bun.

## Decision

Add a `pnpm-workspace.yaml` at the repo root covering `apps/*` and `packages/*`. Use **pnpm** as the JS package manager. `packages/kosmos-design/` is a real workspace package (`@kosmos/design`) consumed by `apps/web` via `workspace:*`, not a plain asset folder or `file:` reference.

pnpm was chosen over npm/yarn/bun for strict phantom-dependency isolation (each package can only import what it declares), native `workspace:*` protocol, and first-class support on Vercel.

## Consequences

- The repo now has two independent workspace managers: `uv` for Python services, `pnpm` for JS apps and packages. They operate on separate ecosystems and do not interfere.
- `apps/mobile`, when it arrives, gets `@kosmos/design` tokens and brand assets for free via the same workspace.
- A plain asset folder would have required `file:../packages/...` references in `package.json`, which break under hoisting and don't survive `create-next-app` upgrades cleanly.
- Node version is pinned to 22.14.0 LTS via `.nvmrc` and `"engines"` in root `package.json`; pnpm enforces the `engines` constraint at install time.