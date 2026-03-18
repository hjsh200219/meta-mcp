import type { MetaApiClient } from './types.js';
import type {
  Ad,
  CreateAdParams,
  ListParams,
  PaginatedResponse,
  UpdateAdParams,
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

export async function listAds(
  client: MetaApiClient,
  adSetId: string,
  params?: ListParams
): Promise<PaginatedResponse<Ad>> {
  const query: Record<string, string> = {
    fields: 'id,name,adset_id,creative{id},status',
  };
  if (params?.status_filter) query.filtering = JSON.stringify([{ field: 'effective_status', operator: 'IN', value: [params.status_filter] }]);
  if (params?.limit) query.limit = String(params.limit);
  if (params?.after) query.after = params.after;

  const res = await client.get<{ data: Ad[]; paging?: { cursors?: { after?: string }; next?: string } }>(
    `/${adSetId}/ads`,
    query
  );
  return parsePaginatedResponse(res);
}

export async function getAd(client: MetaApiClient, adId: string): Promise<Ad> {
  const res = await client.get<Ad>(`/${adId}`, {
    fields: 'id,name,adset_id,creative{id},status',
  });
  return res;
}

export async function createAd(
  client: MetaApiClient,
  adAccountId: string,
  params: CreateAdParams
): Promise<{ id: string }> {
  const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  const body: Record<string, unknown> = {
    name: params.name,
    adset_id: params.adset_id,
    creative: params.creative,
    status: params.status,
  };
  const res = await client.post<{ id: string }>(`/${accountId}/ads`, body);
  return { id: res.id };
}

export async function updateAd(
  client: MetaApiClient,
  adId: string,
  params: UpdateAdParams
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.status !== undefined) body.status = params.status;
  if (params.creative !== undefined) body.creative = params.creative;
  if (Object.keys(body).length === 0) return;
  await client.post(`/${adId}`, body);
}

export async function deleteAd(client: MetaApiClient, adId: string): Promise<void> {
  await client.delete(`/${adId}`);
}
