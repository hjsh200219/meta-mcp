import type { MetaApiClient } from './types.js';
import type {
  Campaign,
  CreateCampaignParams,
  ListParams,
  PaginatedResponse,
  UpdateCampaignParams,
} from './types.js';

function parsePaginatedResponse<T>(raw: {
  data: T[];
  paging?: { cursors?: { after?: string }; next?: string };
}): PaginatedResponse<T> {
  return {
    data: raw.data,
    pagination: {
      next_cursor: raw.paging?.cursors?.after ?? null,
      has_next: !!raw.paging?.next,
    },
  };
}

export async function listCampaigns(
  client: MetaApiClient,
  adAccountId: string,
  params?: ListParams
): Promise<PaginatedResponse<Campaign>> {
  const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  const query: Record<string, string> = {
    fields: 'id,name,objective,status,daily_budget,lifetime_budget,created_time,updated_time',
  };
  if (params?.status_filter) query.filtering = JSON.stringify([{ field: 'effective_status', operator: 'IN', value: [params.status_filter] }]);
  if (params?.limit) query.limit = String(params.limit);
  if (params?.after) query.after = params.after;

  const res = await client.get<{ data: Campaign[]; paging?: { cursors?: { after?: string }; next?: string } }>(
    `/${accountId}/campaigns`,
    query
  );
  return parsePaginatedResponse(res);
}

export async function getCampaign(client: MetaApiClient, campaignId: string): Promise<Campaign> {
  const res = await client.get<Campaign>(`/${campaignId}`, {
    fields: 'id,name,objective,status,daily_budget,lifetime_budget,created_time,updated_time',
  });
  return res;
}

export async function createCampaign(
  client: MetaApiClient,
  adAccountId: string,
  params: CreateCampaignParams
): Promise<{ id: string }> {
  const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  const body: Record<string, unknown> = {
    name: params.name,
    objective: params.objective,
    status: params.status,
  };
  if (params.special_ad_categories?.length) body.special_ad_categories = params.special_ad_categories;
  if (params.daily_budget) body.daily_budget = params.daily_budget;
  if (params.lifetime_budget) body.lifetime_budget = params.lifetime_budget;

  const res = await client.post<{ id: string }>(`/${accountId}/campaigns`, body);
  return { id: res.id };
}

export async function updateCampaign(
  client: MetaApiClient,
  campaignId: string,
  params: UpdateCampaignParams
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.status !== undefined) body.status = params.status;
  if (params.daily_budget !== undefined) body.daily_budget = params.daily_budget;
  if (params.lifetime_budget !== undefined) body.lifetime_budget = params.lifetime_budget;
  if (Object.keys(body).length === 0) return;
  await client.post(`/${campaignId}`, body);
}

export async function deleteCampaign(client: MetaApiClient, campaignId: string): Promise<void> {
  await client.delete(`/${campaignId}`);
}
