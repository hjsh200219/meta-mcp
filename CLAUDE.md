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

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

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

| Document | Path |
|----------|------|
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Quality Standards | [docs/QUALITY.md](docs/QUALITY.md) |
| Reliability | [docs/RELIABILITY.md](docs/RELIABILITY.md) |
| Layer Rules | [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) |
| Design Docs Index | [docs/design-docs/index.md](docs/design-docs/index.md) |
| Product Specs | [docs/product-specs/index.md](docs/product-specs/index.md) |

## Tech Stack

Node.js >= 20, TypeScript (strict), @modelcontextprotocol/sdk, Express 5, Zod 4, pino, Vitest, Docker
