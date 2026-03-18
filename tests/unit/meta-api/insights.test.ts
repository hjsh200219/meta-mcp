import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCampaignInsights,
  getAdSetInsights,
  getAdInsights,
} from '../../../src/meta-api/insights.js';
import type { MetaApiClient } from '../../../src/meta-api/types.js';

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
} as unknown as MetaApiClient;

describe('insights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCampaignInsights', () => {
    it('get_인사이트데이터반환', async () => {
      const raw = {
        data: [{ date_start: '2024-01-01', date_stop: '2024-01-07', impressions: '1000', spend: '50' }],
      };
      vi.mocked(mockClient.get).mockResolvedValue(raw);

      const result = await getCampaignInsights(mockClient, 'c1', { date_preset: 'last_7d' });

      expect(mockClient.get).toHaveBeenCalledWith('/c1/insights', expect.any(Object));
      expect(result).toHaveLength(1);
      expect(result[0].impressions).toBe('1000');
    });
  });

  describe('getAdSetInsights', () => {
    it('get_인사이트데이터반환', async () => {
      const raw = {
        data: [{ date_start: '2024-01-01', date_stop: '2024-01-07', clicks: '20' }],
      };
      vi.mocked(mockClient.get).mockResolvedValue(raw);

      const result = await getAdSetInsights(mockClient, 'as1', { date_preset: 'last_7d' });

      expect(mockClient.get).toHaveBeenCalledWith('/as1/insights', expect.any(Object));
      expect(result).toHaveLength(1);
    });
  });

  describe('getAdInsights', () => {
    it('get_인사이트데이터반환', async () => {
      const raw = {
        data: [{ date_start: '2024-01-01', date_stop: '2024-01-07', ctr: '2.5' }],
      };
      vi.mocked(mockClient.get).mockResolvedValue(raw);

      const result = await getAdInsights(mockClient, 'ad1', { date_preset: 'last_7d' });

      expect(mockClient.get).toHaveBeenCalledWith('/ad1/insights', expect.any(Object));
      expect(result).toHaveLength(1);
    });
  });
});
