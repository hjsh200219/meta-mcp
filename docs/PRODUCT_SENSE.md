# Product Sense

## What This Product Is

meta-mcp is an infrastructure tool that enables AI agents to manage Instagram advertising campaigns through the Meta Marketing API. It is not a user-facing product -- it is a bridge between AI agents (Claude, Cursor, etc.) and Meta's ad platform.

## Target Users

1. **AI agents** (primary): Claude Desktop, Cursor, or any MCP-compatible AI agent that needs to create and manage Instagram ads programmatically.
2. **Developers** (secondary): Engineers who deploy and configure the MCP server for their AI agent workflows.

## Core Value Proposition

Without meta-mcp, an AI agent would need to:
- Understand the Meta Graph API authentication flow (access tokens, app secret proofs)
- Handle pagination, rate limiting, and retry logic
- Parse and format Meta API error responses
- Manage API versioning

meta-mcp abstracts all of this behind 22 simple, validated MCP tools.

## Product Decisions

### Why 22 tools instead of a generic API proxy?
Each tool has a specific Zod schema, clear description, and well-defined behavior (cache, invalidate, retry). This gives AI agents strong type guidance and predictable behavior. A generic proxy would force the agent to know the Graph API schema.

### Why two transport modes?
- **stdio**: Zero-config for local development. Just set `META_ACCESS_TOKEN` and connect.
- **HTTP**: Enables shared deployments where multiple agents or users connect to one server, each with their own Meta token via headers.

### Why in-memory cache instead of Redis?
Simplicity. The server is designed for single-instance deployments. The cache primarily protects against rate limits during conversational back-and-forth where an agent might read the same data multiple times in seconds. Redis is tracked as future tech debt (TD-004).

### Why no webhook support?
MCP is request-response. The current protocol does not have a clean mechanism for server-initiated notifications. If MCP adds push capabilities, webhooks become viable.

## Success Metrics

- Tool invocation success rate (errors should be Meta API errors, not server bugs)
- Cache hit rate (higher = fewer API calls = better rate limit utilization)
- Time to add a new resource (should take < 2 hours following the layer pattern)

## Competitive Landscape

This is a purpose-built MCP server. Alternatives include:
- Generic HTTP MCP servers (less structured, no caching/retry)
- Direct Meta API calls from agents (requires API knowledge, no rate limit protection)
- Meta's own SDKs (not MCP-compatible, require code integration)
