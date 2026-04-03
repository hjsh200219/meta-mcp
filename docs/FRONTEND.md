# Frontend

## 공통 금지 사항

- **이모지를 UI 아이콘으로 사용 금지.** OS/브라우저마다 렌더링이 다르고, 텍스트와 간격이 맞지 않음. SVG 아이콘 또는 Remixicon 사용.
- **미구현 페이지로 링크 금지.** 페이지가 없으면 disabled 처리 + "준비 중" 태그 표시.
- **E2E 테스트는 로그인/비로그인 두 상태 모두 검증.**
- **디자인 리뷰 시 모든 상태의 스크린샷 확인 필수.**


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
