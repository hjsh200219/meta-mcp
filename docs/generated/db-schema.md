# Data Schema

## Overview

meta-mcp does not use a database. It is a stateless MCP server that proxies requests to the Meta Marketing API (Graph API). All state lives in Meta's platform. The only local state is an in-memory TTL cache (`TtlCache`) for read optimization.

## Domain Types

All types are defined in `src/meta-api/types.ts`.

### Campaign
```typescript
interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time?: string;
  updated_time?: string;
}
```

### AdSet
```typescript
interface AdSet {
  id: string;
  name: string;
  campaign_id: string;
  optimization_goal: string;
  billing_event: string;
  bid_amount?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  targeting?: Record<string, unknown>;
  status: string;
  start_time?: string;
  end_time?: string;
}
```

### Ad
```typescript
interface Ad {
  id: string;
  name: string;
  adset_id: string;
  creative: { id: string };
  status: string;
}
```

### AdCreative
```typescript
interface AdCreative {
  id: string;
  name: string;
  object_story_spec?: Record<string, unknown>;
}
```

### InsightData
```typescript
interface InsightData {
  impressions?: string;
  clicks?: string;
  spend?: string;
  reach?: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  date_start: string;
  date_stop: string;
  [key: string]: unknown;
}
```

### AdAccount
```typescript
interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
}
```

### InstagramAccount
```typescript
interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profile_pic?: string;
}
```

## Cache Schema

`TtlCache` key patterns:

| Key Pattern | TTL | Source Tool |
|-------------|-----|------------|
| `list_campaigns:{json_params}` | 60s | list_campaigns |
| `get_campaign:{id}` | 60s | get_campaign |
| `list_ad_sets:{json_params}` | 60s | list_ad_sets |
| `get_ad_set:{id}` | 60s | get_ad_set |
| `list_ads:{json_params}` | 60s | list_ads |
| `get_ad:{id}` | 60s | get_ad |
| `get_ad_creative:{id}` | 60s | get_ad_creative |
| `get_ad_accounts:{json_params}` | 60s | get_ad_accounts |
| `get_instagram_accounts:{id}` | 60s | get_instagram_accounts |
| `*_insights:{json_params}` | 300s | insight tools |

Write operations invalidate by prefix (e.g., `cache.invalidate('list_campaigns:')`).

## Meta Graph API Endpoints

| Domain | Read | Create | Update | Delete |
|--------|------|--------|--------|--------|
| Campaigns | `GET /{account_id}/campaigns` | `POST /{account_id}/campaigns` | `POST /{campaign_id}` | `DELETE /{campaign_id}` |
| Ad Sets | `GET /{account_id}/adsets` | `POST /{account_id}/adsets` | `POST /{adset_id}` | `DELETE /{adset_id}` |
| Ads | `GET /{account_id}/ads` | `POST /{account_id}/ads` | `POST /{ad_id}` | `DELETE /{ad_id}` |
| Creatives | `GET /{creative_id}` | `POST /{account_id}/adcreatives` | -- | -- |
| Insights | `GET /{entity_id}/insights` | -- | -- | -- |
| Accounts | `GET /me/adaccounts`, `GET /{page_id}/instagram_accounts` | -- | -- | -- |
