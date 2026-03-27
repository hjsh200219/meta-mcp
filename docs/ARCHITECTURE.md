# Architecture

## Overview

Instagram Ads MCP Server -- a Node.js/TypeScript service that wraps Meta Marketing API (Graph API) and exposes it as 22 MCP tools for AI agents to manage Instagram advertising campaigns.

## Transport Modes

| Mode | Entry point | Transport | Use case |
|------|-------------|-----------|----------|
| stdio | `src/stdio.ts` | `StdioServerTransport` | Single-user, local (Cursor/Claude Desktop) |
| HTTP | `src/index.ts` -> `src/app.ts` | `StreamableHTTPServerTransport` over Express | Multi-user, remote/shared |

## Layer Diagram

```
Entrypoints          stdio.ts / index.ts + app.ts
                          |
MCP Server           server.ts  (McpServer, tool registration)
                          |
Tools                tools/*    (registerXxxTools -- MCP handler wrappers)
                          |
Schemas              schemas/*  (Zod validation for tool inputs)
                          |
Meta-API             meta-api/* (HTTP client, CRUD functions, types)
                          |
Lib                  lib/*      (config, errors, cache, logger)
                          |
Middleware           middleware/auth.ts  (Bearer token auth, HTTP mode only)
```

## Key Layers

### 1. Entrypoints (`src/index.ts`, `src/stdio.ts`)

- `index.ts`: Boots Express HTTP server, calls `createApp()`, listens on configurable port.
- `stdio.ts`: Reads `META_ACCESS_TOKEN` from env, creates `MetaApiClient` + `TtlCache` + MCP server, connects via stdio.

### 2. App / HTTP Layer (`src/app.ts`)

- `createApp(config)` -- builds Express app with `POST/GET/DELETE /mcp` and `GET /health`.
- Per-request: resolves Meta token from `X-Meta-Access-Token` header or env fallback, builds `MetaApiClient`, creates MCP server + `StreamableHTTPServerTransport`.
- Auth middleware protects `/mcp` endpoints via Bearer token (timing-safe compare).

### 3. MCP Server (`src/server.ts`)

- `createMcpServer(client, cache, logger)` -- instantiates `McpServer` and registers all 6 tool groups (campaigns, adSets, ads, creatives, insights, accounts).

### 4. Tools (`src/tools/`)

Each tool module exports a `registerXxxTools()` function that binds Zod-validated schemas to API call handlers.

- **Read tools**: Check `TtlCache` first, call meta-api on miss, cache result (60s for CRUD, 300s for insights).
- **Write tools**: Call meta-api, log the write op, invalidate relevant cache keys.
- All tools wrap handlers with `withErrorHandling()` for uniform error formatting via `toMcpError()`.

| File | Tools |
|------|-------|
| `accounts.ts` | `get_ad_accounts`, `get_instagram_accounts` |
| `campaigns.ts` | `list_campaigns`, `get_campaign`, `create_campaign`, `update_campaign`, `delete_campaign` |
| `adSets.ts` | `list_ad_sets`, `get_ad_set`, `create_ad_set`, `update_ad_set`, `delete_ad_set` |
| `ads.ts` | `list_ads`, `get_ad`, `create_ad`, `update_ad`, `delete_ad` |
| `creatives.ts` | `create_ad_creative`, `get_ad_creative` |
| `insights.ts` | `get_campaign_insights`, `get_ad_set_insights`, `get_ad_insights` |

### 5. Schemas (`src/schemas/`)

Zod-based input validation objects used by MCP tool registration. Shared `PaginationSchema` and `StatusFilterSchema` in `common.ts`.

### 6. Meta-API (`src/meta-api/`)

- `client.ts`: `MetaApiClient` class -- `get()`, `post()`, `delete()` with retry (3x exponential backoff on 429), `appsecret_proof` HMAC, lazy token validation via `/me`.
- `types.ts`: Interface for `MetaApiClient` (duck-typed), all domain types (Campaign, AdSet, Ad, AdCreative, InsightData, etc.), and `MetaErrorResponse`.
- Domain modules (`campaigns.ts`, `adSets.ts`, `ads.ts`, `creatives.ts`, `insights.ts`, `accounts.ts`): Stateless functions that call `client.get/post/delete` and parse paginated responses.

### 7. Lib (`src/lib/`)

| File | Purpose |
|------|---------|
| `config.ts` | `AppConfig` interface, env var loading + validation (API version format, hex validation, min token length) |
| `errors.ts` | Error hierarchy (`MetaMcpError` -> `MetaApiError`, `AuthenticationError`, `RateLimitError`, `ValidationError`, `ConfigurationError`) + `toMcpError()` |
| `cache.ts` | `TtlCache` -- in-memory Map with TTL, periodic sweep (60s), prefix-based invalidation |
| `logger.ts` | pino logger factory with secret redaction |

### 8. Middleware (`src/middleware/auth.ts`)

- `createAuthMiddleware(token)` -- Express middleware, timing-safe Bearer token comparison.

## Data Flow (HTTP mode)

```
Client -> POST /mcp + Bearer + X-Meta-Access-Token
  -> authMiddleware (validate MCP_AUTH_TOKEN)
  -> resolveMetaToken (header or env fallback)
  -> buildClient (MetaApiClient with token)
  -> createMcpServer (registers 22 tools)
  -> StreamableHTTPServerTransport handles MCP protocol
  -> Tool handler: cache check -> meta-api call -> cache set -> MCP response
```

## Test Structure

```
tests/
  unit/
    lib/         (cache, config, errors, logger)
    meta-api/    (accounts, ads, adSets, campaigns, client, creatives, insights)
    middleware/  (auth)
    schemas/     (accounts, ads, adSets, campaigns, common, creatives, insights)
    tools/       (accounts, campaigns)
  integration/
    server.test.ts
```

## Tech Stack

- Runtime: Node.js >= 20, ESM modules
- Language: TypeScript 5.x (strict mode)
- MCP SDK: `@modelcontextprotocol/sdk` ^1.27.1
- HTTP: Express 5.x
- Validation: Zod 4.x
- Logging: pino 10.x
- Testing: Vitest 4.x, supertest 7.x
- Linting: ESLint 10 + typescript-eslint (strict)
- Build: `tsc` -> `dist/`
- Container: Docker multi-stage (node:20-alpine)
