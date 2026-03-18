import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MetaApiClient } from '../meta-api/types.js';
import type { TtlCache } from '../lib/cache.js';
import type { Logger } from '../lib/logger.js';
import * as adSetApi from '../meta-api/adSets.js';
import {
  ListAdSetsSchema,
  GetAdSetSchema,
  CreateAdSetSchema,
  UpdateAdSetSchema,
  DeleteAdSetSchema,
} from '../schemas/adSets.js';

export function registerAdSetTools(
  server: McpServer,
  client: MetaApiClient,
  cache: TtlCache,
  logger: Logger
): void {
  server.tool(
    'list_ad_sets',
    'List ad sets with pagination',
    ListAdSetsSchema,
    async (params) => {
      const cacheKey = `list_ad_sets:${JSON.stringify(params)}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const result = await adSetApi.listAdSets(client, params.campaign_id, {
        status_filter: params.status_filter,
        limit: params.limit,
        after: params.after,
      });
      const text = JSON.stringify(result);
      cache.set(cacheKey, text, 60_000);
      return { content: [{ type: 'text' as const, text }] };
    }
  );

  server.tool(
    'get_ad_set',
    'Get ad set by ID',
    GetAdSetSchema,
    async (params) => {
      const cacheKey = `get_ad_set:${params.ad_set_id}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const result = await adSetApi.getAdSet(client, params.ad_set_id);
      const text = JSON.stringify(result);
      cache.set(cacheKey, text, 60_000);
      return { content: [{ type: 'text' as const, text }] };
    }
  );

  server.tool(
    'create_ad_set',
    'Create a new ad set',
    CreateAdSetSchema,
    async (params) => {
      const result = await adSetApi.createAdSet(client, params.ad_account_id, {
        campaign_id: params.campaign_id,
        name: params.name,
        optimization_goal: params.optimization_goal,
        billing_event: params.billing_event,
        bid_amount: params.bid_amount,
        daily_budget: params.daily_budget,
        lifetime_budget: params.lifetime_budget,
        targeting: params.targeting as Record<string, unknown>,
        instagram_positions: params.instagram_positions,
        start_time: params.start_time,
        end_time: params.end_time,
        status: params.status,
      });
      logger.info({ tool: 'create_ad_set', campaignId: params.campaign_id }, 'Write op');
      cache.invalidate('list_ad_sets:');
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    }
  );

  server.tool(
    'update_ad_set',
    'Update ad set',
    UpdateAdSetSchema,
    async (params) => {
      await adSetApi.updateAdSet(client, params.ad_set_id, {
        name: params.name,
        status: params.status,
        daily_budget: params.daily_budget,
        bid_amount: params.bid_amount,
        targeting: params.targeting as Record<string, unknown> | undefined,
      });
      logger.info({ tool: 'update_ad_set', adSetId: params.ad_set_id }, 'Write op');
      cache.invalidate('list_ad_sets:');
      cache.invalidate(`get_ad_set:${params.ad_set_id}`);
      return { content: [{ type: 'text' as const, text: 'OK' }] };
    }
  );

  server.tool(
    'delete_ad_set',
    'Delete ad set',
    DeleteAdSetSchema,
    async (params) => {
      await adSetApi.deleteAdSet(client, params.ad_set_id);
      logger.info({ tool: 'delete_ad_set', adSetId: params.ad_set_id }, 'Write op');
      cache.invalidate('list_ad_sets:');
      cache.invalidate(`get_ad_set:${params.ad_set_id}`);
      return { content: [{ type: 'text' as const, text: 'OK' }] };
    }
  );
}
