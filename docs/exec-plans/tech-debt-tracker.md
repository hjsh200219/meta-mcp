# Tech Debt Tracker

## Active Debt

### TD-001: Missing unit tests for tools/ads, tools/adSets, tools/creatives, tools/insights
- **Priority**: High
- **Layer**: L2 Tools
- **Description**: Only `tools/accounts.ts` and `tools/campaigns.ts` have unit tests. The other 4 tool modules (ads, adSets, creatives, insights) lack tests.
- **Impact**: Regressions in those tools would not be caught before deployment.
- **Fix estimate**: 4 hours (follow existing campaigns.test.ts pattern)

### TD-002: Per-request MCP server creation in HTTP mode
- **Priority**: Medium
- **Layer**: L0 Entrypoints
- **Description**: `app.ts` creates a new `McpServer` instance for every `/mcp` request (POST and GET). The `McpServer` setup includes registering all 22 tools each time.
- **Impact**: Slight overhead per request. Not a problem at low traffic but could matter at scale.
- **Fix estimate**: 2 hours (pool or reuse server instances with per-request client binding)

### TD-003: No request-level timeout
- **Priority**: Medium
- **Layer**: L4 Meta-API
- **Description**: `MetaApiClient` fetch calls have no explicit timeout. A slow Meta API response could hang indefinitely.
- **Impact**: Long-lived connections consume resources. In HTTP mode, Express default timeout applies but stdio has none.
- **Fix estimate**: 1 hour (add `AbortController` with configurable timeout to MetaApiClient)

### TD-004: Cache is in-memory, not shared
- **Priority**: Low
- **Layer**: L5 Lib
- **Description**: `TtlCache` uses an in-memory Map. In multi-process or multi-container deployments, each instance has its own cache.
- **Impact**: Cache invalidation from one instance does not affect others. Acceptable for single-instance deployments.
- **Fix estimate**: 4 hours (Redis adapter behind the TtlCache interface)

### TD-005: No integration test for stdio transport
- **Priority**: Low
- **Layer**: Tests
- **Description**: `tests/integration/server.test.ts` covers HTTP mode only. No test exercises the stdio entrypoint.
- **Impact**: Stdio-specific issues (env var loading, transport setup) are untested.
- **Fix estimate**: 2 hours

## Resolved Debt

| ID | Description | Resolved in |
|----|-------------|-------------|
| -- | -- | -- |
