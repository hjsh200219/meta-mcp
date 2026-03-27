# Quality Standards

## Type Safety

- TypeScript strict mode enabled (`strict: true` in tsconfig.json)
- All tool inputs validated through Zod schemas before execution
- Domain types defined in `src/meta-api/types.ts` -- use these, do not use `any`
- `MetaApiClient` interface in `types.ts` decouples tools from concrete HTTP client

## Linting

- ESLint 10 + typescript-eslint strict config
- Unused vars forbidden (except `_`-prefixed args)
- Run: `npm run lint`

## Testing

- Framework: Vitest 4.x with globals enabled
- Structure mirrors `src/` under `tests/unit/` and `tests/integration/`
- Coverage provider: v8, covers `src/**/*.ts` (excludes `src/index.ts`)
- Run: `npm test` (single run), `npm run test:watch` (watch mode)

### Test conventions

- Unit tests: Mock `MetaApiClient` interface, test meta-api functions, schemas, tools, lib independently
- Integration tests: `tests/integration/server.test.ts` -- tests the full Express app via supertest
- Each new tool MUST have corresponding unit tests in `tests/unit/tools/`
- Each new schema MUST have validation tests in `tests/unit/schemas/`

## Error Handling

- All tool handlers wrapped in `withErrorHandling()` (see `src/tools/utils.ts`)
- Errors mapped to MCP error format via `toMcpError()` -- never expose raw stack traces
- Error hierarchy in `src/lib/errors.ts`:
  - `MetaMcpError` (base)
  - `MetaApiError` (Graph API errors with code/subcode/fbtrace_id)
  - `AuthenticationError`
  - `RateLimitError` (includes `retryAfterSeconds`)
  - `ValidationError`
  - `ConfigurationError`

## Logging

- pino with automatic redaction of sensitive fields: `accessToken`, `authorization`, `META_ACCESS_TOKEN`, `MCP_AUTH_TOKEN`
- Write operations logged at `info` level with tool name and entity ID
- Tool failures logged at `warn` level

## Code Patterns

- Pure functions in `meta-api/*.ts` -- stateless, receive client as parameter
- Tools are registered via `registerXxxTools(server, client, cache, logger)` pattern
- Cache reads before API calls; writes invalidate related cache keys
- Express middleware uses timing-safe comparison for auth tokens
- Docker multi-stage build keeps production image minimal (no devDependencies)
