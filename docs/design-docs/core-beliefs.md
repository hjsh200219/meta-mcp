# Core Beliefs

Foundational design principles that guide all decisions in the meta-mcp project.

## 1. Layer Isolation Over Convenience

Every module lives in exactly one layer. Import direction is strictly top-down. We pay the cost of writing a few more lines rather than creating a shortcut that couples layers. If a tool module needs utility from another tool module, extract it to `lib/` or `tools/utils.ts`.

**Why**: Prevents circular dependencies, enables testing each layer in isolation by mocking only the layer below, and allows swapping transports (stdio/HTTP) without touching business logic.

## 2. Schemas Are Leaf Nodes

`src/schemas/*.ts` files import only from `zod`. They define input shapes and validation rules -- nothing else. No business logic, no side effects, no dependencies on the rest of the codebase.

**Why**: Schemas can be reused outside the MCP context (e.g., CLI validation, documentation generation). They are the most stable part of the codebase and should never break due to changes in other layers.

## 3. Meta-API Is Transport-Agnostic

`src/meta-api/*.ts` functions know nothing about MCP protocol, Express, or caching. They receive a `MetaApiClient` interface and return typed data. They are pure functions with the client as a parameter.

**Why**: The Meta Graph API wrapper can be used from future transports, batch jobs, or scripts without changes. Testing is straightforward: mock the client, assert the call.

## 4. Fail Fast, Fail Safe

Configuration validation happens at startup (`loadAndValidateConfig()`). Invalid config throws `ConfigurationError` immediately. At runtime, every tool handler is wrapped in `withErrorHandling()` to convert all errors to MCP format -- no raw stack traces escape.

**Why**: Startup failures are caught before serving traffic. Runtime failures are always user-friendly and traceable via Meta error codes.

## 5. Cache Reads, Invalidate on Writes

Read tools check `TtlCache` before making API calls. Write tools never cache their results -- they invalidate related cache keys via prefix matching. Cache TTLs are intentionally short (60s CRUD, 300s insights) to balance freshness with rate limit protection.

**Why**: Meta Graph API has strict rate limits. Caching reduces API calls while invalidation ensures writes are immediately reflected in subsequent reads.

## 6. Retry Reads, Never Retry Writes

GET and DELETE operations retry up to 3 times on HTTP 429 with exponential backoff. POST operations never retry because they are not idempotent -- a duplicate write could create duplicate campaigns or ads.

**Why**: Protects against transient rate limits on reads while preventing accidental duplicate mutations.

## 7. Secrets Stay in Environment

No secret values are hardcoded or committed. All sensitive configuration (tokens, app secrets) comes from environment variables. Pino logger redacts known sensitive field names. Docker production image excludes dev dependencies.

**Why**: Defense in depth. Even if logs are leaked, secrets are redacted. Even if the image is inspected, no credentials are baked in.

## 8. Types Over Runtime Checks

TypeScript strict mode is non-negotiable. Domain types are defined in `src/meta-api/types.ts` and used throughout. Zod schemas handle external input validation. Internal function signatures use typed interfaces, never `any`.

**Why**: Catches errors at compile time. Reduces the need for defensive runtime checks. Makes refactoring safe.
