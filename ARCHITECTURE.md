# Architecture

## System Overview

meta-mcp is an MCP (Model Context Protocol) server that wraps the Meta Marketing API (Graph API v25.0) as 22 tools for AI agents to manage Instagram advertising campaigns. It supports two transport modes: stdio for local single-user usage and HTTP (Express) for remote multi-user deployments.

## High-Level Diagram

```
                  +------------------+
                  |   AI Agent       |
                  |  (Claude, etc.)  |
                  +--------+---------+
                           |
              MCP Protocol (stdio or HTTP)
                           |
           +---------------+---------------+
           |                               |
   +-------+--------+           +---------+--------+
   |  stdio.ts (L0) |           | index.ts (L0)    |
   |  StdioTransport |           | + app.ts          |
   +-------+--------+           | Express + HTTP    |
           |                    | + auth middleware  |
           |                    +--------+----------+
           |                             |
           +----------+  +--------------+
                      |  |
              +-------+--+-------+
              |   server.ts (L1) |
              |   McpServer      |
              |   Tool registry  |
              +-------+----------+
                      |
        +-------------+-------------+
        |             |             |
  +-----+-----+ +----+----+ +-----+-----+
  | tools/ L2 | | tools/  | | tools/    |
  | campaigns | | adSets  | | insights  |
  | ads       | | creative| | accounts  |
  +-----+-----+ +----+----+ +-----+-----+
        |             |             |
   +----+----+   +----+----+       |
   |schemas/ |   |meta-api/|  <----+
   |  L3     |   |  L4     |
   |Zod valid|   |HTTP CRUD|
   +----+----+   +----+----+
        |              |
        |         +----+----+
        +-------->| lib/ L5 |
                  | config  |
                  | errors  |
                  | cache   |
                  | logger  |
                  +---------+
```

## Transport Modes

| Mode | Entrypoint | Transport | Auth | Use Case |
|------|-----------|-----------|------|----------|
| stdio | `src/stdio.ts` | `StdioServerTransport` | `META_ACCESS_TOKEN` env only | Local dev (Cursor, Claude Desktop) |
| HTTP | `src/index.ts` + `src/app.ts` | `StreamableHTTPServerTransport` | Bearer token + `X-Meta-Access-Token` header | Multi-user, remote/shared |

## Layer Architecture

The codebase follows a strict 7-layer architecture with unidirectional dependencies.

| Layer | Location | Responsibility | May Import |
|-------|----------|---------------|------------|
| L0 Entrypoints | `src/index.ts`, `src/stdio.ts`, `src/app.ts` | Bootstrap, transport setup | L1, L4, L5, L6 |
| L1 MCP Server | `src/server.ts` | Tool registration orchestrator | L2 |
| L2 Tools | `src/tools/*.ts` | MCP handler wrappers, cache logic | L3, L4, L5 |
| L3 Schemas | `src/schemas/*.ts` | Zod input validation | zod only |
| L4 Meta-API | `src/meta-api/*.ts` | HTTP client, CRUD functions, types | L5 |
| L5 Lib | `src/lib/*.ts` | Config, errors, cache, logger | Node built-ins, npm |
| L6 Middleware | `src/middleware/*.ts` | Bearer auth (HTTP mode) | Node built-ins |

See [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) for full import constraints.

## Tool Inventory (22 tools)

| Module | Tools | Type |
|--------|-------|------|
| accounts | `get_ad_accounts`, `get_instagram_accounts` | Read |
| campaigns | `list_campaigns`, `get_campaign`, `create_campaign`, `update_campaign`, `delete_campaign` | CRUD |
| adSets | `list_ad_sets`, `get_ad_set`, `create_ad_set`, `update_ad_set`, `delete_ad_set` | CRUD |
| ads | `list_ads`, `get_ad`, `create_ad`, `update_ad`, `delete_ad` | CRUD |
| creatives | `create_ad_creative`, `get_ad_creative` | Read+Write |
| insights | `get_campaign_insights`, `get_ad_set_insights`, `get_ad_insights` | Read |

## Data Flow (HTTP Mode)

```
1. Client -> POST /mcp + Bearer token + X-Meta-Access-Token header
2. authMiddleware: timing-safe compare of Bearer token vs MCP_AUTH_TOKEN
3. resolveMetaToken: header > env fallback
4. buildClient: new MetaApiClient(token, appSecret, apiVersion)
5. createMcpServer: registers 22 tools with (client, cache, logger)
6. StreamableHTTPServerTransport: handles MCP protocol framing
7. Tool handler: cache.get() -> [hit: return] / [miss: meta-api call -> cache.set() -> return]
8. Write tools: meta-api call -> cache.invalidate(prefix) -> return
```

## Cross-Cutting Concerns

### Error Handling
`withErrorHandling()` wraps every tool handler. All errors converted to MCP format via `toMcpError()`. Error hierarchy: `MetaMcpError` -> `MetaApiError` | `AuthenticationError` | `RateLimitError` | `ValidationError` | `ConfigurationError`.

### Caching
`TtlCache` (in-memory Map with TTL). Read tools: 60s for CRUD data, 300s for insights. Write tools invalidate via prefix matching. Background sweep every 60s (timer is `unref()`'d).

### Retry
GET/DELETE: 3 retries on 429 with exponential backoff (respects `Retry-After`). POST: no retry (non-idempotent).

### Security
Bearer token auth (timing-safe), `appsecret_proof` HMAC-SHA256, pino log redaction of secrets, env-only secret storage, Docker multi-stage with no devDeps.

## File Map

```
src/
  index.ts              HTTP entrypoint (Express + port)
  stdio.ts              Stdio entrypoint (local MCP)
  app.ts                Express app factory (/mcp, /health)
  server.ts             MCP server factory (tool registration)
  tools/
    accounts.ts         get_ad_accounts, get_instagram_accounts
    campaigns.ts        CRUD campaigns (5 tools)
    adSets.ts           CRUD ad sets (5 tools)
    ads.ts              CRUD ads (5 tools)
    creatives.ts        create + get ad creative
    insights.ts         get insights for campaigns/adSets/ads
    utils.ts            withErrorHandling wrapper
  schemas/
    common.ts           PaginationSchema, StatusFilterSchema
    accounts.ts         Account tool input schemas
    campaigns.ts        Campaign tool input schemas
    adSets.ts           Ad set tool input schemas
    ads.ts              Ad tool input schemas
    creatives.ts        Creative tool input schemas
    insights.ts         Insight tool input schemas
  meta-api/
    client.ts           MetaApiClient (HTTP, retry, HMAC)
    types.ts            All domain types + MetaApiClient interface
    accounts.ts         Account API functions
    campaigns.ts        Campaign API functions
    adSets.ts           Ad set API functions
    ads.ts              Ad API functions
    creatives.ts        Creative API functions
    insights.ts         Insight API functions
  lib/
    config.ts           AppConfig, env loading, validation
    errors.ts           Error hierarchy + toMcpError()
    cache.ts            TtlCache (TTL Map + sweep)
    logger.ts           pino logger factory + redaction
  middleware/
    auth.ts             Bearer token middleware (timing-safe)
tests/
  unit/
    lib/                cache, config, errors, logger
    meta-api/           accounts, ads, adSets, campaigns, client, creatives, insights
    middleware/          auth
    schemas/            accounts, ads, adSets, campaigns, common, creatives, insights
    tools/              accounts, campaigns
  integration/
    server.test.ts      Full HTTP mode test via supertest
```
