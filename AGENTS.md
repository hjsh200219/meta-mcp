# Agent Map

This file is the navigation hub for AI agents working on the meta-mcp codebase.
Read `agent.md` (symlinked from CLAUDE.md) for project rules and quick commands.

## Project Identity

Instagram Ads MCP Server -- wraps Meta Marketing API as 22 MCP tools for AI agents.

## Quick Commands

| Task | Command |
|------|---------|
| Build | `npm run build` |
| Dev | `npm run dev` |
| Test | `npm test` |
| Lint | `npm run lint` |
| Start HTTP | `MCP_AUTH_TOKEN=xxx npm start` |
| Start stdio | `META_ACCESS_TOKEN=xxx npm run start:stdio` |

## Layer Architecture

```
L0  Entrypoints     src/index.ts, src/stdio.ts, src/app.ts
L1  MCP Server      src/server.ts
L2  Tools           src/tools/*  (6 modules, 22 tools)
L3  Schemas         src/schemas/* (Zod validation)
L4  Meta-API        src/meta-api/* (HTTP client + CRUD)
L5  Lib             src/lib/*  (config, errors, cache, logger)
L6  Middleware       src/middleware/auth.ts
```

Import direction: top layers import from bottom layers, never upward.

## Documentation Map

| Document | Path | Purpose |
|----------|------|---------|
| Agent Instructions | [agent.md](agent.md) | Core rules, patterns, commands |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) | System overview, layer diagram, data flow |
| Architecture (detailed) | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Full architecture with all details |
| Design Docs | [docs/design-docs/index.md](docs/design-docs/index.md) | Design decisions and ADRs |
| Core Beliefs | [docs/design-docs/core-beliefs.md](docs/design-docs/core-beliefs.md) | Foundational design principles |
| Layer Rules | [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) | Import constraints per layer |
| Execution Plans | [docs/exec-plans/](docs/exec-plans/) | Active and completed plans |
| Tech Debt | [docs/exec-plans/tech-debt-tracker.md](docs/exec-plans/tech-debt-tracker.md) | Known debt and priorities |
| Product Specs | [docs/product-specs/index.md](docs/product-specs/index.md) | Feature specifications |
| Quality Standards | [docs/QUALITY.md](docs/QUALITY.md) | Type safety, testing, linting rules |
| Quality Score | [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) | Current quality metrics |
| Reliability | [docs/RELIABILITY.md](docs/RELIABILITY.md) | Retry, caching, error boundaries |
| Security | [docs/SECURITY.md](docs/SECURITY.md) | Auth, secrets, attack surface |
| Design Patterns | [docs/DESIGN.md](docs/DESIGN.md) | Key patterns and conventions |
| Product Sense | [docs/PRODUCT_SENSE.md](docs/PRODUCT_SENSE.md) | Product context and decisions |
| Plans Overview | [docs/PLANS.md](docs/PLANS.md) | Roadmap and priorities |
| References | [docs/references/](docs/references/) | External references |

## Key Patterns (Agent Checklist)

When adding a new Meta API resource:
1. `src/meta-api/resource.ts` -- CRUD functions, add types to `types.ts`
2. `src/schemas/resource.ts` -- Zod input schemas
3. `src/tools/resource.ts` -- `registerResourceTools()` with `withErrorHandling()`
4. `src/server.ts` -- add registration call
5. Tests in `tests/unit/` for each layer

When modifying tools:
- Wrap handlers in `withErrorHandling()` -> `toMcpError()`
- Read tools: cache check first (60s CRUD, 300s insights)
- Write tools: invalidate related cache keys after mutation
- Never cross-import between tool modules

## Tech Stack

Node.js >= 20 | TypeScript strict | MCP SDK | Express 5 | Zod 4 | pino | Vitest | Docker
