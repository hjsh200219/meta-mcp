# Reliability

## Rate Limiting & Retry

- `MetaApiClient.get()` and `delete()` retry up to 3 times on HTTP 429 with exponential backoff
- Retry delay respects `Retry-After` header when present; falls back to `2^attempt * 1000ms`
- `post()` does NOT retry (write operations are not idempotent)
- After max retries, throws `RateLimitError` with `retryAfterSeconds`

## Caching

- `TtlCache`: in-memory Map with TTL per entry
- Read tools cache for 60 seconds (CRUD), insight tools cache for 300 seconds
- Write tools invalidate related cache keys via prefix matching (`cache.invalidate('list_campaigns:')`)
- Background sweep every 60 seconds removes expired entries
- Timer is `unref()`'d -- does not prevent process exit

## Token Validation

- Lazy validation: first API call triggers `/me` check, subsequent calls skip
- Validation is deduplicated via stored Promise (`validateTokenPromise`)
- `/me` call bypasses validation check to avoid circular dependency

## Authentication

- HTTP mode: Bearer token auth via timing-safe comparison (`timingSafeEqual`)
- Per-request Meta token resolution: `X-Meta-Access-Token` header > `META_ACCESS_TOKEN` env
- Missing token returns 400, invalid MCP token returns 403

## Configuration Validation

- `loadAndValidateConfig()` validates at startup:
  - `MCP_AUTH_TOKEN` required and warns if < 32 chars
  - `META_API_VERSION` must match `v{number}.{number}` pattern
  - `META_APP_SECRET` must be hex string if provided
- `ConfigurationError` thrown on invalid config -- fails fast

## Graceful Shutdown

- `SIGTERM` handler in `src/index.ts` closes HTTP server gracefully
- 10-second timeout before forced exit
- `TtlCache.destroy()` clears interval timer and store

## Error Boundaries

- Tool level: `withErrorHandling()` catches all errors and converts to MCP error format
- API level: `handleMetaError()` parses Meta Graph API error responses into typed `MetaApiError`
- Transport level: `res.on('close')` closes transport on connection drop

## Security

- `appsecret_proof` HMAC-SHA256 when `META_APP_SECRET` is provided
- Sensitive fields redacted in logs (pino redact config)
- Docker production image runs without dev dependencies
- No secrets in codebase -- all via environment variables (see `.env.example`)
