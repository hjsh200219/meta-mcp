# Design Patterns

## Tool Registration Pattern

Every tool module exports a single `registerXxxTools(server, client, cache, logger)` function. This function registers tools with the MCP server using Zod schemas for input validation and `withErrorHandling()` for uniform error formatting.

```
registerXxxTools(server, client, cache, logger)
  -> server.tool(name, description, zodSchema, wrappedHandler)
     -> withErrorHandling(name, logger, async (params) => { ... })
```

This pattern ensures:
- All tools have consistent registration signatures
- Error handling is never forgotten
- Cache and logger are injected, not imported

## Read Tool Pattern

```
1. Generate cache key from tool name + serialized params
2. Check cache: if hit, return cached text
3. Call meta-api function with typed params
4. Serialize result to JSON string
5. Cache the string with TTL (60s CRUD / 300s insights)
6. Return MCP text content
```

## Write Tool Pattern

```
1. Call meta-api function with typed params
2. Log write operation at info level (tool name + entity ID)
3. Invalidate related cache keys via prefix matching
4. Return MCP text content ("OK" or JSON result)
```

## MetaApiClient Design

The client uses interface-based polymorphism:
- `src/meta-api/types.ts` defines the `MetaApiClient` interface (get, post, delete)
- `src/meta-api/client.ts` implements the concrete class with retry, HMAC, token validation
- Tool modules and meta-api functions depend on the interface, not the implementation
- Tests mock the interface for fast, isolated unit tests

## Error Hierarchy

```
MetaMcpError (base)
  +-- MetaApiError (code, subcode, fbtraceId)
  +-- AuthenticationError
  +-- RateLimitError (retryAfterSeconds)
  +-- ValidationError
  +-- ConfigurationError
```

`toMcpError()` converts any error into the MCP response format: `{ isError: true, content: [{ type: 'text', text }] }`.

## Cache Invalidation Strategy

Write tools invalidate cache using prefix matching:
- `create_campaign` -> `cache.invalidate('list_campaigns:')`
- `update_campaign` -> `cache.invalidate('list_campaigns:')` + `cache.invalidate('get_campaign:{id}')`
- `delete_campaign` -> same as update

This ensures list queries are refreshed after mutations while avoiding over-invalidation.

## Token Resolution (HTTP Mode)

```
X-Meta-Access-Token header  >  META_ACCESS_TOKEN env  >  400 error
```

Per-request resolution allows multi-tenant usage where each client provides its own Meta token.

## Configuration Validation

`loadAndValidateConfig()` runs at startup (HTTP mode only). It validates:
- `MCP_AUTH_TOKEN` is present and warns if < 32 chars
- `META_API_VERSION` matches `v{number}.{number}` pattern
- `META_APP_SECRET` is valid hex if provided

Stdio mode reads `META_ACCESS_TOKEN` directly and skips full config validation.
