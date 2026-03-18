import type { MetaApiClient } from './types.js';
import type { AdCreative, CreateAdCreativeParams } from './types.js';

export async function createAdCreative(
  client: MetaApiClient,
  adAccountId: string,
  params: CreateAdCreativeParams
): Promise<{ id: string }> {
  const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  const res = await client.post<{ id: string }>(`/${accountId}/adcreatives`, params);
  return { id: res.id };
}

export async function getAdCreative(client: MetaApiClient, creativeId: string): Promise<AdCreative> {
  const res = await client.get<AdCreative>(`/${creativeId}`, {
    fields: 'id,name,object_story_spec',
  });
  return res;
}
