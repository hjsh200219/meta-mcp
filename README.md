# Instagram Ads MCP Server

Meta Marketing API를 래핑하여 Instagram 광고를 생성/수정/조회/삭제할 수 있는 MCP(Model Context Protocol) 서버입니다. Railway에 배포하여 Cursor, Claude Desktop 등의 MCP 클라이언트에서 원격으로 사용합니다.

## 주요 기능

- 캠페인, 광고세트, 광고, 크리에이티브 CRUD
- 인사이트(성과) 조회
- 커서 기반 페이지네이션
- TTL 인메모리 캐시로 Rate Limit 대응
- Bearer token 인증 + appsecret_proof 이중 보안
- Stateless 아키텍처 (Railway 호환)

## MCP 도구 목록 (18개)

| 카테고리 | 도구 |
|---------|------|
| 계정 | `get_ad_accounts`, `get_instagram_accounts` |
| 캠페인 | `list_campaigns`, `get_campaign`, `create_campaign`, `update_campaign`, `delete_campaign` |
| 광고세트 | `list_ad_sets`, `get_ad_set`, `create_ad_set`, `update_ad_set`, `delete_ad_set` |
| 광고 | `list_ads`, `get_ad`, `create_ad`, `update_ad`, `delete_ad` |
| 크리에이티브 | `create_ad_creative`, `get_ad_creative` |
| 인사이트 | `get_campaign_insights`, `get_ad_set_insights`, `get_ad_insights` |

## 환경변수

| 변수 | 설명 | 필수 | 기본값 |
|------|------|:----:|--------|
| `META_ACCESS_TOKEN` | Meta System User Access Token | Yes | — |
| `MCP_AUTH_TOKEN` | MCP 엔드포인트 Bearer 인증 토큰 (최소 32자) | Yes | — |
| `META_AD_ACCOUNT_ID` | 기본 광고 계정 ID (act_XXXXX) | No | — |
| `META_APP_SECRET` | 앱 시크릿 (appsecret_proof 자동 활성화) | No | — |
| `META_API_VERSION` | Meta Graph API 버전 | No | `v25.0` |
| `PORT` | 서버 포트 | No | `3000` |
| `LOG_LEVEL` | 로그 레벨 (debug, info, warn, error) | No | `info` |

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일 편집하여 토큰 입력

# 개발 서버 실행
npm run dev

# 빌드 & 실행
npm run build
npm start
```

## 테스트

```bash
npm test
```

## Docker 빌드

```bash
docker build -t meta-mcp .
docker run -p 3000:3000 --env-file .env meta-mcp
```

## Railway 배포

1. GitHub 저장소를 Railway에 연결
2. 환경변수 설정 (위 표 참고)
3. 자동 배포 완료

## MCP 클라이언트 연결

### Cursor / Claude Desktop

```json
{
  "mcpServers": {
    "instagram-ads": {
      "url": "https://<railway-domain>/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_AUTH_TOKEN>"
      }
    }
  }
}
```

## 헬스체크

- `GET /health` — 프로세스 상태 (uptime, memory, version)
- `GET /health/deep` — Meta API 연결 확인 (결과 60초 캐싱)

## Meta Access Token 발급

1. [Meta Business Suite](https://business.facebook.com/) → 비즈니스 설정
2. 시스템 사용자 생성 → 토큰 발급
3. 권한: `ads_management`, `ads_read`, `business_management`
4. 발급된 토큰을 `META_ACCESS_TOKEN` 환경변수에 설정

## 기술 스택

- Node.js 20, TypeScript (strict)
- `@modelcontextprotocol/sdk` v1.x
- Express + StreamableHTTPServerTransport
- Zod, pino, Vitest
