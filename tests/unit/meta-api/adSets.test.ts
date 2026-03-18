import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  listAdSets,
  getAdSet,
  createAdSet,
  updateAdSet,
  deleteAdSet,
} from '../../../src/meta-api/adSets.js';
import type { MetaApiClient } from '../../../src/meta-api/types.js';

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
} as unknown as MetaApiClient;

describe('adSets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listAdSets', () => {
    it('list_페이지네이션포함_데이터반환', async () => {
      const raw = {
        data: [
          {
            id: 'as1',
            name: 'AdSet 1',
            campaign_id: 'c1',
            optimization_goal: 'LINK_CLICKS',
            billing_event: 'IMPRESSIONS',
            status: 'ACTIVE',
          },
        ],
        paging: { cursors: { after: 'cur' }, next: 'https://n' },
      };
      vi.mocked(mockClient.get).mockResolvedValue(raw);

      const result = await listAdSets(mockClient, 'c1', { limit: 25, after: 'prev' });

      expect(mockClient.get).toHaveBeenCalledWith('/c1/adsets', expect.any(Object));
      expect(result.data).toHaveLength(1);
      expect(result.pagination.next_cursor).toBe('cur');
    });
  });

  describe('getAdSet', () => {
    it('get_단일광고세트반환', async () => {
      const adSet = {
        id: 'as1',
        name: 'Test',
        campaign_id: 'c1',
        optimization_goal: 'LINK_CLICKS',
        billing_event: 'IMPRESSIONS',
        status: 'ACTIVE',
      };
      vi.mocked(mockClient.get).mockResolvedValue(adSet);

      const result = await getAdSet(mockClient, 'as1');

      expect(mockClient.get).toHaveBeenCalledWith('/as1', expect.any(Object));
      expect(result).toEqual(adSet);
    });
  });

  describe('createAdSet', () => {
    it('create_경로및파라미터검증', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({ id: 'as_new' });

      const result = await createAdSet(mockClient, 'act_123', {
        name: 'New AdSet',
        campaign_id: 'c1',
        optimization_goal: 'LINK_CLICKS',
        billing_event: 'IMPRESSIONS',
        targeting: { age_min: 18, age_max: 65 },
      });

      expect(mockClient.post).toHaveBeenCalledWith('/act_123/adsets', expect.objectContaining({
        name: 'New AdSet',
        campaign_id: 'c1',
        optimization_goal: 'LINK_CLICKS',
        billing_event: 'IMPRESSIONS',
        targeting: { age_min: 18, age_max: 65 },
      }));
      expect(result).toEqual({ id: 'as_new' });
    });
  });

  describe('updateAdSet', () => {
    it('update_수정파라미터전달', async () => {
      vi.mocked(mockClient.post).mockResolvedValue(undefined);

      await updateAdSet(mockClient, 'as1', { name: 'Updated', status: 'ACTIVE' });

      expect(mockClient.post).toHaveBeenCalledWith('/as1', { name: 'Updated', status: 'ACTIVE' });
    });
  });

  describe('deleteAdSet', () => {
    it('delete_삭제호출', async () => {
      vi.mocked(mockClient.delete).mockResolvedValue(undefined);

      await deleteAdSet(mockClient, 'as1');

      expect(mockClient.delete).toHaveBeenCalledWith('/as1');
    });
  });
});
