import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MetaApiClient } from '../meta-api/types.js';
import type { TtlCache } from '../lib/cache.js';
import type { Logger } from '../lib/logger.js';
import * as adApi from '../meta-api/ads.js';
import { withErrorHandling } from './utils.js';
import {
  ListAdsSchema,
  GetAdSchema,
  CreateAdSchema,
  UpdateAdSchema,
  DeleteAdSchema,
} from '../schemas/ads.js';

export function registerAdTools(
  server: McpServer,
  client: MetaApiClient,
  cache: TtlCache,
  logger: Logger,
): void {
  server.tool('list_ads', 'List ads with pagination', ListAdsSchema,
    withErrorHandling('list_ads', logger, async (params) => {
      const cacheKey = `list_ads:${JSON.stringify(params)}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const result = await adApi.listAds(client, params.ad_set_id, {
        status_filter: params.status_filter,
        limit: params.limit,
        after: params.after,
      });
      const text = JSON.stringify(result);
      cache.set(cacheKey, text, 60_000);
      return { content: [{ type: 'text' as const, text }] };
    }),
  );

  server.tool('get_ad', 'Get ad by ID', GetAdSchema,
    withErrorHandling('get_ad', logger, async (params) => {
      const cacheKey = `get_ad:${params.ad_id}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const result = await adApi.getAd(client, params.ad_id);
      const text = JSON.stringify(result);
      cache.set(cacheKey, text, 60_000);
      return { content: [{ type: 'text' as const, text }] };
    }),
  );

  server.tool('create_ad', 'Create a new ad', CreateAdSchema,
    withErrorHandling('create_ad', logger, async (params) => {
      const result = await adApi.createAd(client, params.ad_account_id, {
        adset_id: params.ad_set_id,
        name: params.name,
        creative: { creative_id: params.creative_id },
        status: params.status,
      });
      logger.info({ tool: 'create_ad', adSetId: params.ad_set_id }, 'Write op');
      cache.invalidate('list_ads:');
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    }),
  );

  server.tool('update_ad', 'Update ad', UpdateAdSchema,
    withErrorHandling('update_ad', logger, async (params) => {
      const updateParams: { name?: string; status?: string; creative?: { creative_id: string } } = {};
      if (params.name !== undefined) updateParams.name = params.name;
      if (params.status !== undefined) updateParams.status = params.status;
      if (params.creative_id !== undefined) updateParams.creative = { creative_id: params.creative_id };
      await adApi.updateAd(client, params.ad_id, updateParams);
      logger.info({ tool: 'update_ad', adId: params.ad_id }, 'Write op');
      cache.invalidate('list_ads:');
      cache.invalidate(`get_ad:${params.ad_id}`);
      return { content: [{ type: 'text' as const, text: 'OK' }] };
    }),
  );

  server.tool('delete_ad', 'Delete ad', DeleteAdSchema,
    withErrorHandling('delete_ad', logger, async (params) => {
      await adApi.deleteAd(client, params.ad_id);
      logger.info({ tool: 'delete_ad', adId: params.ad_id }, 'Write op');
      cache.invalidate('list_ads:');
      cache.invalidate(`get_ad:${params.ad_id}`);
      return { content: [{ type: 'text' as const, text: 'OK' }] };
    }),
  );
}
