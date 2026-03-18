# Instagram Ads MCP Server

Meta Marketing API를 래핑하여 Instagram 광고를 생성/수정/조회/삭제할 수 있는 MCP 서버입니다.

## 사용 방법

### Cursor에서 로컬 실행 (권장)

`.cursor/mcp.json` (또는 전역 `~/.cursor/mcp.json`)에 추가:

```json
{
  "mcpServers": {
    "instagram-ads": {
      "command": "node",
      "args": ["/절대경로/meta-mcp/dist/stdio.js"],
      "env": {
        "META_ACCESS_TOKEN": "내_Meta_System_User_토큰"
      }
    }
  }
}
```

> 각 사용자가 자기 토큰을 설정하면 됩니다. 서버 공유 불필요.

### Claude Desktop

`claude_desktop_config.json`에 동일 형식으로 추가.

### HTTP 서버 (원격/공유 용도)

여러 사용자가 하나의 서버를 공유할 때 사용합니다:

```bash
MCP_AUTH_TOKEN="서버_인증_토큰" npm start
```

각 사용자는 `X-Meta-Access-Token` 헤더로 자기 Meta 토큰을 전달합니다:

```json
{
  "mcpServers": {
    "instagram-ads": {
      "url": "https://서버주소/mcp",
      "headers": {
        "Authorization": "Bearer 서버_인증_토큰",
        "X-Meta-Access-Token": "내_Meta_토큰"
      }
    }
  }
}
```

## 설치

```bash
git clone https://github.com/hjsh200219/meta-mcp.git
cd meta-mcp
npm install
npm run build
```

## MCP 도구 목록 (22개)

| 카테고리 | 도구 |
|---------|------|
| 계정 | `get_ad_accounts`, `get_instagram_accounts` |
| 캠페인 | `list_campaigns`, `get_campaign`, `create_campaign`, `update_campaign`, `delete_campaign` |
| 광고세트 | `list_ad_sets`, `get_ad_set`, `create_ad_set`, `update_ad_set`, `delete_ad_set` |
| 광고 | `list_ads`, `get_ad`, `create_ad`, `update_ad`, `delete_ad` |
| 크리에이티브 | `create_ad_creative`, `get_ad_creative` |
| 인사이트 | `get_campaign_insights`, `get_ad_set_insights`, `get_ad_insights` |

## 환경변수

| 변수 | 설명 | stdio | HTTP |
|------|------|:-----:|:----:|
| `META_ACCESS_TOKEN` | Meta System User Token | 필수 | 선택 (헤더 폴백) |
| `MCP_AUTH_TOKEN` | MCP 엔드포인트 인증 토큰 | 불필요 | 필수 |
| `META_APP_SECRET` | 앱 시크릿 (appsecret_proof) | 선택 | 선택 |
| `META_API_VERSION` | Graph API 버전 | 선택 (v25.0) | 선택 (v25.0) |
| `LOG_LEVEL` | 로그 레벨 | 선택 (warn) | 선택 (info) |

## Meta Access Token 발급

1. [Meta Business Suite](https://business.facebook.com/) → 비즈니스 설정
2. 시스템 사용자 생성 → 토큰 발급
3. 권한: `ads_management`, `ads_read`, `business_management`

## 테스트

```bash
npm test
```

## 기술 스택

Node.js 20, TypeScript (strict), `@modelcontextprotocol/sdk`, Express, Zod, pino, Vitest
