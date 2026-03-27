# Plans & Roadmap

## Current State (v1.0.0)

The server is feature-complete for core Instagram advertising operations:
- 22 MCP tools covering campaigns, ad sets, ads, creatives, insights, and accounts
- Dual transport: stdio (local) and HTTP (remote)
- Caching, retry, error handling, and auth are production-ready

## Near-Term Priorities

### P0: Test Coverage Gaps
- Add unit tests for `tools/ads.ts`, `tools/adSets.ts`, `tools/creatives.ts`, `tools/insights.ts`
- Add stdio integration test
- See [tech-debt-tracker.md](exec-plans/tech-debt-tracker.md) TD-001, TD-005

### P1: Robustness
- Add request-level timeout to MetaApiClient (AbortController)
- See [tech-debt-tracker.md](exec-plans/tech-debt-tracker.md) TD-003

### P2: New Resources
Potential Meta API resources to add:
- **Audiences**: Custom audience management (create, update, delete custom audiences)
- **Images/Videos**: Media upload and management
- **Pages**: Page info and Instagram business account linking
- **Pixels**: Conversion tracking pixel management

### P3: Operational
- Health check enhancement (Meta API connectivity check)
- Prometheus-compatible metrics endpoint
- Structured request logging with correlation IDs

## Long-Term Considerations

- **Shared cache**: Redis adapter for multi-instance deployments (TD-004)
- **Batch operations**: Batch API support for bulk campaign/ad operations
- **Webhook support**: Receive Meta webhook events for real-time updates
- **Rate limit awareness**: Track API usage quota and expose remaining budget to agents

## Non-Goals

- No frontend or admin UI (see [FRONTEND.md](FRONTEND.md))
- No direct database -- all state lives in Meta's platform
- No multi-platform support -- this server is Meta/Instagram-only
