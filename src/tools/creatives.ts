import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MetaApiClient } from '../meta-api/types.js';
import type { TtlCache } from '../lib/cache.js';
import type { Logger } from '../lib/logger.js';
import * as creativeApi from '../meta-api/creatives.js';
import { withErrorHandling } from './utils.js';
import { CreateAdCreativeSchema, GetAdCreativeSchema } from '../schemas/creatives.js';

function buildObjectStorySpec(params: {
  page_id: string;
  instagram_actor_id: string;
  image_url?: string;
  video_id?: string;
  message: string;
  link?: string;
  call_to_action?: { type: string; value?: Record<string, unknown> };
}): Record<string, unknown> {
  const base = { page_id: params.page_id, instagram_actor_id: params.instagram_actor_id };
  if (params.video_id) {
    return {
      ...base,
      video_data: {
        video_id: params.video_id,
        message: params.message,
        ...(params.call_to_action && { call_to_action: params.call_to_action }),
      },
    };
  }
  return {
    ...base,
    link_data: {
      image_url: params.image_url,
      link: params.link,
      message: params.message,
      ...(params.call_to_action && { call_to_action: params.call_to_action }),
    },
  };
}

export function registerCreativeTools(
  server: McpServer,
  client: MetaApiClient,
  cache: TtlCache,
  logger: Logger,
): void {
  server.tool('create_ad_creative', 'Create ad creative (image or video)', CreateAdCreativeSchema,
    withErrorHandling('create_ad_creative', logger, async (params) => {
      if (!params.image_url && !params.video_id) {
        throw new Error('Must provide image_url or video_id');
      }
      const objectStorySpec = buildObjectStorySpec({
        page_id: params.page_id,
        instagram_actor_id: params.instagram_actor_id,
        image_url: params.image_url,
        video_id: params.video_id,
        message: params.message,
        link: params.link,
        call_to_action: params.call_to_action,
      });
      const result = await creativeApi.createAdCreative(client, params.ad_account_id, {
        name: params.name,
        object_story_spec: objectStorySpec as {
          page_id: string;
          instagram_actor_id: string;
          link_data?: { image_url?: string; link?: string; message?: string; call_to_action?: { type: string; value?: Record<string, unknown> } };
          video_data?: { video_id: string; message?: string; call_to_action?: { type: string; value?: Record<string, unknown> } };
        },
      });
      logger.info({ tool: 'create_ad_creative', adAccountId: params.ad_account_id }, 'Write op');
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    }),
  );

  server.tool('get_ad_creative', 'Get creative by ID', GetAdCreativeSchema,
    withErrorHandling('get_ad_creative', logger, async (params) => {
      const cacheKey = `get_ad_creative:${params.creative_id}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const result = await creativeApi.getAdCreative(client, params.creative_id);
      const text = JSON.stringify(result);
      cache.set(cacheKey, text, 60_000);
      return { content: [{ type: 'text' as const, text }] };
    }),
  );
}
