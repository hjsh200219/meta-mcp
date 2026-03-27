# Frontend

## Not Applicable

meta-mcp is a headless MCP server with no frontend or UI. It exposes tools via the Model Context Protocol (MCP) for consumption by AI agents (Claude Desktop, Cursor, etc.) and via HTTP for programmatic clients.

## Client Interfaces

### MCP Protocol (Primary)
AI agents connect via stdio or HTTP transport and invoke tools through the MCP protocol. The agent sees tool names, descriptions, and Zod-validated input schemas.

### HTTP Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/mcp` | POST | MCP protocol handler (StreamableHTTP) |
| `/mcp` | GET | MCP protocol handler (SSE stream) |
| `/mcp` | DELETE | Session cleanup (returns 204) |
| `/health` | GET | Health check (status, uptime, version) |

### Health Check Response
```json
{
  "status": "ok",
  "uptime": 123.456,
  "version": "1.0.0"
}
```

## Future Considerations

If a monitoring dashboard or admin UI is ever needed, it should be built as a separate project that consumes the `/health` endpoint and Meta API directly, not embedded in the MCP server.
