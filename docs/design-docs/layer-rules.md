# Layer Dependency Rules

## Layer Stack (top to bottom)

```
L0  Entrypoints     src/index.ts, src/stdio.ts, src/app.ts
L1  MCP Server      src/server.ts
L2  Tools           src/tools/*
L3  Schemas         src/schemas/*
L4  Meta-API        src/meta-api/*
L5  Lib             src/lib/*
L6  Middleware       src/middleware/*
```

## Import Rules

| From | May import | Must NOT import |
|------|-----------|-----------------|
| L0 Entrypoints | L1, L4, L5, L6 | L2, L3 |
| L1 MCP Server | L2 (registration only) | L3, L4 |
| L2 Tools | L3, L4, L5 | L0, L1, other L2 modules |
| L3 Schemas | zod only | L0-L2, L4, L5 |
| L4 Meta-API | L5 (errors, logger) | L0-L3, L6 |
| L5 Lib | Node built-ins, npm packages | L0-L4, L6 |
| L6 Middleware | Node built-ins | L0-L5 |

## Key Constraints

1. **Schemas are leaf nodes**: `src/schemas/*` import only from `zod`. They define input shapes and nothing else.
2. **Meta-API is transport-agnostic**: `src/meta-api/*` knows nothing about MCP protocol, Express, or tools. It only uses the `MetaApiClient` interface and lib utilities.
3. **Tools bridge MCP and Meta-API**: `src/tools/*` import from schemas (for registration) and meta-api (for business logic). They do not import from other tool modules.
4. **Lib has zero internal dependencies**: `src/lib/*` modules may depend on each other (`config` imports `errors`) but never import from upper layers.
5. **Middleware is standalone**: `src/middleware/auth.ts` uses only Node.js crypto. No app-layer imports.

## Adding a New Domain

When adding a new Meta API resource (e.g., "audiences"):

1. **L4**: Create `src/meta-api/audiences.ts` with CRUD functions. Add types to `src/meta-api/types.ts`.
2. **L3**: Create `src/schemas/audiences.ts` with Zod schemas for each tool input.
3. **L2**: Create `src/tools/audiences.ts` with `registerAudienceTools()`.
4. **L1**: Add `registerAudienceTools()` call in `src/server.ts`.
5. **Tests**: Add `tests/unit/meta-api/audiences.test.ts`, `tests/unit/schemas/audiences.test.ts`, `tests/unit/tools/audiences.test.ts`.

## Rationale

- Prevents circular dependencies
- Enables testing each layer in isolation (mock only the layer below)
- Keeps schemas reusable outside MCP context
- Meta-API functions can be called from future transports without changes
