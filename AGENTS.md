# meta-mcp

Instagram Ads MCP Server -- wraps Meta Marketing API as 22 MCP tools.

## Quick Reference

- Build: `npm run build`
- Dev: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Start HTTP: `MCP_AUTH_TOKEN=xxx npm start`
- Start stdio: `META_ACCESS_TOKEN=xxx npm run start:stdio`

## Project Structure

```
src/
  index.ts          HTTP entrypoint (Express + port listen)
  stdio.ts          Stdio entrypoint (local MCP)
  app.ts            Express app factory, /mcp + /health routes
  server.ts         MCP server factory, registers all tool groups
  tools/            MCP tool handlers (accounts, campaigns, adSets, ads, creatives, insights)
  schemas/          Zod input schemas per tool group + common
  meta-api/         Meta Graph API client + CRUD functions + types
  lib/              config, errors, cache (TTL), logger (pino)
  middleware/       Bearer token auth (HTTP mode)
tests/
  unit/             Mirrors src/ structure
  integration/      Full server tests via supertest
```

## Architecture Overview

See [ARCHITECTURE.md](ARCHITECTURE.md) for full overview including layer details and test structure.

Layer stack: Entrypoints -> MCP Server -> Tools -> Schemas / Meta-API -> Lib / Middleware

## Layer Rules

See [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md).

- Schemas import only `zod`
- Meta-API imports only from `lib/`
- Tools import from `schemas/` and `meta-api/`
- No cross-imports between tool modules

## Key Patterns

- **Tool registration**: `registerXxxTools(server, client, cache, logger)` in each `tools/*.ts`
- **Error handling**: All tools wrapped in `withErrorHandling()` -> `toMcpError()`
- **Caching**: `TtlCache` -- read tools check cache first (60s CRUD, 300s insights); write tools invalidate
- **Retry**: GET/DELETE retry 3x on 429 with exponential backoff; POST does not retry
- **Auth**: HTTP mode uses timing-safe Bearer token + per-request Meta token from header

## Adding a New Resource

1. `src/meta-api/newResource.ts` -- CRUD functions + add types to `types.ts`
2. `src/schemas/newResource.ts` -- Zod schemas
3. `src/tools/newResource.ts` -- `registerNewResourceTools()`
4. `src/server.ts` -- add registration call
5. Tests in `tests/unit/` for each layer

## Knowledge Base

| Document | Path | Purpose |
|----------|------|---------|
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) | System overview, layer diagram, data flow, test structure |
| Design Patterns | [docs/DESIGN.md](docs/DESIGN.md) | Key patterns |
| Core Beliefs | [docs/design-docs/core-beliefs.md](docs/design-docs/core-beliefs.md) | Design principles |
| Layer Rules | [docs/design-docs/layer-rules.md](docs/design-docs/layer-rules.md) | Import constraints |
| Quality Standards | [docs/QUALITY.md](docs/QUALITY.md) | Type safety, testing, linting |
| Quality Score | [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) | Current quality metrics |
| Reliability | [docs/RELIABILITY.md](docs/RELIABILITY.md) | Retry, caching, shutdown |
| Security | [docs/SECURITY.md](docs/SECURITY.md) | Auth, secrets, threats |
| Product Sense | [docs/PRODUCT_SENSE.md](docs/PRODUCT_SENSE.md) | Product context |
| Plans & Roadmap | [docs/PLANS.md](docs/PLANS.md) | Priorities and roadmap |
| Tech Debt | [docs/exec-plans/tech-debt-tracker.md](docs/exec-plans/tech-debt-tracker.md) | Known debt |
| Data Schema | [docs/generated/db-schema.md](docs/generated/db-schema.md) | Domain types and cache keys |
| Frontend / Interfaces | [docs/FRONTEND.md](docs/FRONTEND.md) | HTTP endpoints, no UI |

## Tech Stack

Node.js >= 20, TypeScript (strict), @modelcontextprotocol/sdk, Express 5, Zod 4, pino, Vitest, Docker


---

# Agent Map

Navigation hub for AI agents working on meta-mcp. CLAUDE.md is a symlink to this file.

## Layer Architecture (Compact)

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

## Agent Checklist

When modifying tools:
- Wrap handlers in `withErrorHandling()` -> `toMcpError()`
- Read tools: cache check first (60s CRUD, 300s insights)
- Write tools: invalidate related cache keys after mutation
- Never cross-import between tool modules

See [Quick Reference](#quick-reference), [Knowledge Base](#knowledge-base), and [Adding a New Resource](#adding-a-new-resource) sections above for commands, docs, and the full new-resource checklist.

> Be concise. No filler. Straight to the point. Use fewer words.


## TDD 필수

모든 새 기능/로직 변경은 반드시 TDD로 개발한다.
1. Red: 실패하는 테스트 먼저 작성
2. Green: 테스트를 통과하는 최소 코드 작성
3. Refactor: 코드 정리
테스트 없는 코드 변경은 허용하지 않는다.

---

## Behavioral Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 세션 시작 시 Handoff 강제

세션을 시작할 때 프로젝트 루트에 `handoff.md` 파일이 있는지 먼저 확인한다.
- `handoff.md`가 존재하면 다른 어떤 작업보다 먼저 **반드시 전체를 읽고 인수인계 컨텍스트를 파악한 뒤 시작**한다.
- 파일이 없으면 정상 진행한다.

이 규칙은 이전 세션의 미완료 작업·결정 사항·주의사항을 놓치지 않기 위한 강제 사항이다.

**이 프로젝트의 handoff 위치**: 없음 (생성 시 `.claude-project/HANDOFF.md` 권장)
