# meta-mcp

Instagram Ads MCP Server -- wraps Meta Marketing API as 22 MCP tools.

## Quick Reference

- Build: `npm run build`
- Dev: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Start HTTP: `MCP_AUTH_TOKEN=xxx npm start`
- Start stdio: `META_ACCESS_TOKEN=xxx npm run start:stdio`

## Project Structure

```
src/
  index.ts          HTTP entrypoint (Express + port listen)
  stdio.ts          Stdio entrypoint (local MCP)
  app.ts            Express app factory, /mcp + /health routes
  server.ts         MCP server factory, registers all tool groups
  tools/            MCP tool handlers (accounts, campaigns, adSets, ads, creatives, insights)
  schemas/          Zod input schemas per tool group + common
  meta-api/         Meta Graph API client + CRUD functions + types
  lib/              config, errors, cache (TTL), logger (pino)
  middleware/       Bearer token auth (HTTP mode)
tests/
  unit/             Mirrors src/ structure
  integration/      Full server tests via supertest
```

## Architecture Overview

See [ARCHITECTURE.md](ARCHITECTURE.md) for full overview and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for layer details.

Layer stack: Entrypoints -> MCP Server -> Tools -> Schemas / Meta-API -> Lib / Middleware

## Layer Rules

See [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md).

- Schemas import only `zod`
- Meta-API imports only from `lib/`
- Tools import from `schemas/` and `meta-api/`
- No cross-imports between tool modules

## Key Patterns

- **Tool registration**: `registerXxxTools(server, client, cache, logger)` in each `tools/*.ts`
- **Error handling**: All tools wrapped in `withErrorHandling()` -> `toMcpError()`
- **Caching**: `TtlCache` -- read tools check cache first (60s CRUD, 300s insights); write tools invalidate
- **Retry**: GET/DELETE retry 3x on 429 with exponential backoff; POST does not retry
- **Auth**: HTTP mode uses timing-safe Bearer token + per-request Meta token from header

## Adding a New Resource

1. `src/meta-api/newResource.ts` -- CRUD functions + add types to `types.ts`
2. `src/schemas/newResource.ts` -- Zod schemas
3. `src/tools/newResource.ts` -- `registerNewResourceTools()`
4. `src/server.ts` -- add registration call
5. Tests in `tests/unit/` for each layer

## Knowledge Base

| Document | Path | Purpose |
|----------|------|---------|
| Agent Map | [AGENTS.md](AGENTS.md) | Navigation hub for agents |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) | System overview, layer diagram, data flow |
| Architecture (layers) | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layer details and test structure |
| Core Beliefs | [docs/design-docs/core-beliefs.md](docs/design-docs/core-beliefs.md) | Design principles |
| Layer Rules | [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) | Import constraints |
| Design Docs Index | [docs/design-docs/index.md](docs/design-docs/index.md) | All design decisions |
| Design Patterns | [docs/DESIGN.md](docs/DESIGN.md) | Key patterns |
| Frontend / Interfaces | [docs/FRONTEND.md](docs/FRONTEND.md) | HTTP endpoints, no UI |
| Quality Standards | [docs/QUALITY.md](docs/QUALITY.md) | Type safety, testing, linting |
| Quality Score | [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) | Current quality metrics |
| Reliability | [docs/RELIABILITY.md](docs/RELIABILITY.md) | Retry, caching, shutdown |
| Security | [docs/SECURITY.md](docs/SECURITY.md) | Auth, secrets, threats |
| Product Sense | [docs/PRODUCT_SENSE.md](docs/PRODUCT_SENSE.md) | Product context |
| Plans & Roadmap | [docs/PLANS.md](docs/PLANS.md) | Priorities and roadmap |
| Execution Plans | [docs/exec-plans/](docs/exec-plans/) | Active and completed plans |
| Tech Debt | [docs/exec-plans/tech-debt-tracker.md](docs/exec-plans/tech-debt-tracker.md) | Known debt |
| Data Schema | [docs/generated/db-schema.md](docs/generated/db-schema.md) | Domain types and cache keys |
| Product Specs | [docs/product-specs/index.md](docs/product-specs/index.md) | Feature specs |
| References | [docs/references/](docs/references/) | External references |

## Tech Stack

Node.js >= 20, TypeScript (strict), @modelcontextprotocol/sdk, Express 5, Zod 4, pino, Vitest, Docker


---

# Agent Map

Navigation hub for AI agents working on meta-mcp. CLAUDE.md is a symlink to this file.

## Layer Architecture (Compact)

```
L0  Entrypoints     src/index.ts, src/stdio.ts, src/app.ts
L1  MCP Server      src/server.ts
L2  Tools           src/tools/*  (6 modules, 22 tools)
L3  Schemas         src/schemas/* (Zod validation)
L4  Meta-API        src/meta-api/* (HTTP client + CRUD)
L5  Lib             src/lib/*  (config, errors, cache, logger)
L6  Middleware       src/middleware/auth.ts
```

Import direction: top layers import from bottom layers, never upward.

## Agent Checklist

When modifying tools:
- Wrap handlers in `withErrorHandling()` -> `toMcpError()`
- Read tools: cache check first (60s CRUD, 300s insights)
- Write tools: invalidate related cache keys after mutation
- Never cross-import between tool modules

See [Quick Reference](#quick-reference), [Knowledge Base](#knowledge-base), and [Adding a New Resource](#adding-a-new-resource) sections above for commands, docs, and the full new-resource checklist.
