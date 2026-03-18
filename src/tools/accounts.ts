import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MetaApiClient } from '../meta-api/types.js';
import type { TtlCache } from '../lib/cache.js';
import type { Logger } from '../lib/logger.js';
import * as accountApi from '../meta-api/accounts.js';
import { GetAdAccountsSchema, GetInstagramAccountsSchema } from '../schemas/accounts.js';

export function registerAccountTools(
  server: McpServer,
  client: MetaApiClient,
  cache: TtlCache,
  _logger: Logger
): void {
  server.tool(
    'get_ad_accounts',
    'List accessible ad accounts',
    GetAdAccountsSchema,
    async (params) => {
      const cacheKey = `get_ad_accounts:${params.after ?? 'null'}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const res = await accountApi.getAdAccounts(client, { after: params.after });
      const result = {
        data: res.data,
        pagination: {
          next_cursor: res.pagination.next_cursor,
          has_next: res.pagination.has_next,
        },
      };
      const text = JSON.stringify(result);
      cache.set(cacheKey, text, 60_000);
      return { content: [{ type: 'text' as const, text }] };
    }
  );

  server.tool(
    'get_instagram_accounts',
    'Get Instagram accounts linked to ad account',
    GetInstagramAccountsSchema,
    async (params) => {
      const cacheKey = `get_instagram_accounts:${params.ad_account_id}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const data = await accountApi.getInstagramAccounts(client, params.ad_account_id);
      const result = { data };
      const text = JSON.stringify(result);
      cache.set(cacheKey, text, 60_000);
      return { content: [{ type: 'text' as const, text }] };
    }
  );
}
