import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../../../src/meta-api/campaigns.js';
import type { MetaApiClient } from '../../../src/meta-api/types.js';

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
} as unknown as MetaApiClient;

describe('campaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listCampaigns', () => {
    it('list_페이지네이션포함_데이터반환', async () => {
      const raw = {
        data: [{ id: 'c1', name: 'Campaign 1', objective: 'OUTCOME_TRAFFIC', status: 'ACTIVE' }],
        paging: { cursors: { after: 'cur' }, next: 'https://n' },
      };
      vi.mocked(mockClient.get).mockResolvedValue(raw);

      const result = await listCampaigns(mockClient, 'act_123', { limit: 25, after: 'prev' });

      expect(mockClient.get).toHaveBeenCalledWith('/act_123/campaigns', expect.any(Object));
      expect(result.data).toHaveLength(1);
      expect(result.pagination.next_cursor).toBe('cur');
    });
  });

  describe('getCampaign', () => {
    it('get_단일캠페인반환', async () => {
      const campaign = { id: 'c1', name: 'Test', objective: 'OUTCOME_TRAFFIC', status: 'ACTIVE' };
      vi.mocked(mockClient.get).mockResolvedValue(campaign);

      const result = await getCampaign(mockClient, 'c1');

      expect(mockClient.get).toHaveBeenCalledWith('/c1', expect.any(Object));
      expect(result).toEqual(campaign);
    });
  });

  describe('createCampaign', () => {
    it('create_경로및파라미터검증', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({ id: 'c_new' });

      const result = await createCampaign(mockClient, 'act_123', {
        name: 'New Campaign',
        objective: 'OUTCOME_TRAFFIC',
        status: 'PAUSED',
      });

      expect(mockClient.post).toHaveBeenCalledWith('/act_123/campaigns', {
        name: 'New Campaign',
        objective: 'OUTCOME_TRAFFIC',
        status: 'PAUSED',
      });
      expect(result).toEqual({ id: 'c_new' });
    });
  });

  describe('updateCampaign', () => {
    it('update_수정파라미터전달', async () => {
      vi.mocked(mockClient.post).mockResolvedValue(undefined);

      await updateCampaign(mockClient, 'c1', { name: 'Updated', status: 'ACTIVE' });

      expect(mockClient.post).toHaveBeenCalledWith('/c1', { name: 'Updated', status: 'ACTIVE' });
    });
  });

  describe('deleteCampaign', () => {
    it('delete_삭제호출', async () => {
      vi.mocked(mockClient.delete).mockResolvedValue(undefined);

      await deleteCampaign(mockClient, 'c1');

      expect(mockClient.delete).toHaveBeenCalledWith('/c1');
    });
  });
});
