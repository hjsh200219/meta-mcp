# Security

## Authentication

### HTTP Mode: Two-Layer Auth
1. **MCP Auth Token** (server access): Bearer token in `Authorization` header, validated via timing-safe comparison (`crypto.timingSafeEqual`). Set via `MCP_AUTH_TOKEN` env var. Minimum recommended length: 32 characters.
2. **Meta Access Token** (API access): Per-request token via `X-Meta-Access-Token` header, with fallback to `META_ACCESS_TOKEN` env var. Used for Meta Graph API calls.

### Stdio Mode: Single-Layer Auth
- `META_ACCESS_TOKEN` read from environment at startup. No additional auth layer needed (single-user, local process).

### Token Validation
- Meta token validated lazily: first API call triggers `GET /me` check. Subsequent calls skip validation.
- Validation is deduplicated via stored Promise to avoid race conditions.

## Secret Management

### Environment Variables
All secrets are loaded from environment variables. No secrets are hardcoded or committed to the repository.

| Variable | Purpose | Required |
|----------|---------|----------|
| `MCP_AUTH_TOKEN` | Server access token (HTTP mode) | HTTP mode only |
| `META_ACCESS_TOKEN` | Meta Graph API token | stdio mode required, HTTP optional |
| `META_APP_SECRET` | App secret for HMAC proof | Optional |

### Log Redaction
pino logger is configured to redact these fields:
- `accessToken`
- `authorization`
- `META_ACCESS_TOKEN`
- `MCP_AUTH_TOKEN`

### Docker Security
- Multi-stage build: production image has no devDependencies, source code, or build tools
- Base image: `node:20-alpine` (minimal attack surface)
- No `USER` directive yet (runs as root in container -- potential improvement)

## API Security

### appsecret_proof
When `META_APP_SECRET` is provided, every Meta API request includes an `appsecret_proof` parameter (HMAC-SHA256 of access token with app secret). This proves server-side API calls are authorized.

### Rate Limit Protection
- GET/DELETE: Retry up to 3x on 429 with exponential backoff
- POST: No retry (prevents duplicate mutations)
- Cache reduces read API call volume

## Attack Surface

### HTTP Endpoints
| Endpoint | Auth Required | Risk |
|----------|--------------|------|
| `POST /mcp` | Bearer token | MCP protocol handler -- full tool access |
| `GET /mcp` | Bearer token | MCP protocol handler -- read operations |
| `DELETE /mcp` | Bearer token | Session cleanup -- minimal risk |
| `GET /health` | None | Info leak: uptime and version only |

### Threat Model
| Threat | Mitigation |
|--------|-----------|
| Token theft | Env-only storage, log redaction, no caching of tokens |
| Timing attack on auth | `crypto.timingSafeEqual` for Bearer comparison |
| Rate limit abuse | Retry limits (3x max), cache reduces calls |
| Request smuggling | Express 5 with default body parsing |
| SSRF via Meta API | Client only calls `graph.facebook.com`, path is user-controlled but scoped to Graph API |

## Known Gaps

1. **No request timeout**: `MetaApiClient` fetch calls have no `AbortController` timeout. A slow Meta API could hang connections.
2. **No container user**: Docker runs as root. Should add `USER node` directive.
3. **No CORS**: Not needed for MCP protocol, but should be explicitly disabled if HTTP endpoint is ever exposed publicly.
4. **No input sanitization beyond Zod**: Zod validates structure and types but does not sanitize string content sent to Meta API. Meta's own API handles this.
