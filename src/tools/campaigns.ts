import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MetaApiClient } from '../meta-api/types.js';
import type { TtlCache } from '../lib/cache.js';
import type { Logger } from '../lib/logger.js';
import * as campaignApi from '../meta-api/campaigns.js';
import { withErrorHandling } from './utils.js';
import {
  ListCampaignsSchema,
  CreateCampaignSchema,
  UpdateCampaignSchema,
  GetCampaignSchema,
  DeleteCampaignSchema,
} from '../schemas/campaigns.js';

export function registerCampaignTools(
  server: McpServer,
  client: MetaApiClient,
  cache: TtlCache,
  logger: Logger,
): void {
  server.tool('list_campaigns', 'List campaigns with pagination', ListCampaignsSchema,
    withErrorHandling('list_campaigns', logger, async (params) => {
      const cacheKey = `list_campaigns:${JSON.stringify(params)}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const result = await campaignApi.listCampaigns(client, params.ad_account_id, {
        status_filter: params.status_filter,
        limit: params.limit,
        after: params.after,
      });
      const text = JSON.stringify(result);
      cache.set(cacheKey, text, 60_000);
      return { content: [{ type: 'text' as const, text }] };
    }),
  );

  server.tool('get_campaign', 'Get campaign by ID', GetCampaignSchema,
    withErrorHandling('get_campaign', logger, async (params) => {
      const cacheKey = `get_campaign:${params.campaign_id}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const result = await campaignApi.getCampaign(client, params.campaign_id);
      const text = JSON.stringify(result);
      cache.set(cacheKey, text, 60_000);
      return { content: [{ type: 'text' as const, text }] };
    }),
  );

  server.tool('create_campaign', 'Create a new campaign', CreateCampaignSchema,
    withErrorHandling('create_campaign', logger, async (params) => {
      const result = await campaignApi.createCampaign(client, params.ad_account_id, {
        name: params.name,
        objective: params.objective,
        status: params.status,
        special_ad_categories: params.special_ad_categories,
        daily_budget: params.daily_budget,
        lifetime_budget: params.lifetime_budget,
      });
      logger.info({ tool: 'create_campaign', adAccountId: params.ad_account_id }, 'Write op');
      cache.invalidate('list_campaigns:');
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    }),
  );

  server.tool('update_campaign', 'Update campaign', UpdateCampaignSchema,
    withErrorHandling('update_campaign', logger, async (params) => {
      await campaignApi.updateCampaign(client, params.campaign_id, {
        name: params.name,
        status: params.status,
        daily_budget: params.daily_budget,
        lifetime_budget: params.lifetime_budget,
      });
      logger.info({ tool: 'update_campaign', campaignId: params.campaign_id }, 'Write op');
      cache.invalidate('list_campaigns:');
      cache.invalidate(`get_campaign:${params.campaign_id}`);
      return { content: [{ type: 'text' as const, text: 'OK' }] };
    }),
  );

  server.tool('delete_campaign', 'Delete campaign', DeleteCampaignSchema,
    withErrorHandling('delete_campaign', logger, async (params) => {
      await campaignApi.deleteCampaign(client, params.campaign_id);
      logger.info({ tool: 'delete_campaign', campaignId: params.campaign_id }, 'Write op');
      cache.invalidate('list_campaigns:');
      cache.invalidate(`get_campaign:${params.campaign_id}`);
      return { content: [{ type: 'text' as const, text: 'OK' }] };
    }),
  );
}
