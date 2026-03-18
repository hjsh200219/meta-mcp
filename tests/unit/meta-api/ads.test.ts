import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  listAds,
  getAd,
  createAd,
  updateAd,
  deleteAd,
} from '../../../src/meta-api/ads.js';
import type { MetaApiClient } from '../../../src/meta-api/types.js';

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
} as unknown as MetaApiClient;

describe('ads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listAds', () => {
    it('list_페이지네이션포함_데이터반환', async () => {
      const raw = {
        data: [
          { id: 'ad1', name: 'Ad 1', adset_id: 'as1', creative: { id: 'cr1' }, status: 'ACTIVE' },
        ],
        paging: { cursors: { after: 'cur' }, next: 'https://n' },
      };
      vi.mocked(mockClient.get).mockResolvedValue(raw);

      const result = await listAds(mockClient, 'as1', { limit: 25, after: 'prev' });

      expect(mockClient.get).toHaveBeenCalledWith('/as1/ads', expect.any(Object));
      expect(result.data).toHaveLength(1);
      expect(result.pagination.next_cursor).toBe('cur');
    });
  });

  describe('getAd', () => {
    it('get_단일광고반환', async () => {
      const ad = { id: 'ad1', name: 'Test', adset_id: 'as1', creative: { id: 'cr1' }, status: 'ACTIVE' };
      vi.mocked(mockClient.get).mockResolvedValue(ad);

      const result = await getAd(mockClient, 'ad1');

      expect(mockClient.get).toHaveBeenCalledWith('/ad1', expect.any(Object));
      expect(result).toEqual(ad);
    });
  });

  describe('createAd', () => {
    it('create_경로및파라미터검증', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({ id: 'ad_new' });

      const result = await createAd(mockClient, 'act_123', {
        name: 'New Ad',
        adset_id: 'as1',
        creative: { creative_id: 'cr1' },
        status: 'PAUSED',
      });

      expect(mockClient.post).toHaveBeenCalledWith('/act_123/ads', {
        name: 'New Ad',
        adset_id: 'as1',
        creative: { creative_id: 'cr1' },
        status: 'PAUSED',
      });
      expect(result).toEqual({ id: 'ad_new' });
    });
  });

  describe('updateAd', () => {
    it('update_수정파라미터전달', async () => {
      vi.mocked(mockClient.post).mockResolvedValue(undefined);

      await updateAd(mockClient, 'ad1', { name: 'Updated', status: 'ACTIVE' });

      expect(mockClient.post).toHaveBeenCalledWith('/ad1', { name: 'Updated', status: 'ACTIVE' });
    });
  });

  describe('deleteAd', () => {
    it('delete_삭제호출', async () => {
      vi.mocked(mockClient.delete).mockResolvedValue(undefined);

      await deleteAd(mockClient, 'ad1');

      expect(mockClient.delete).toHaveBeenCalledWith('/ad1');
    });
  });
});
