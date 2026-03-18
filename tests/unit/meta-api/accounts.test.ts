import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAdAccounts, getInstagramAccounts } from '../../../src/meta-api/accounts.js';
import type { MetaApiClient } from '../../../src/meta-api/types.js';

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
} as unknown as MetaApiClient;

describe('accounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdAccounts', () => {
    it('list_페이지네이션포함_데이터반환', async () => {
      const raw = {
        data: [{ id: 'act_123', name: 'Account 1', account_id: '123', account_status: 1, currency: 'USD' }],
        paging: { cursors: { after: 'cursor1' }, next: 'https://next' },
      };
      vi.mocked(mockClient.get).mockResolvedValue(raw);

      const result = await getAdAccounts(mockClient, { limit: 25, after: 'prev' });

      expect(mockClient.get).toHaveBeenCalledWith('/me/adaccounts', expect.any(Object));
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('act_123');
      expect(result.pagination.next_cursor).toBe('cursor1');
      expect(result.pagination.has_next).toBe(true);
    });

    it('list_파라미터없음_기본호출', async () => {
      vi.mocked(mockClient.get).mockResolvedValue({ data: [] });

      await getAdAccounts(mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/me/adaccounts', expect.any(Object));
    });
  });

  describe('getInstagramAccounts', () => {
    it('get_IG계정목록반환', async () => {
      const raw = {
        data: [{ id: 'ig_1', username: 'mybrand', name: 'My Brand' }],
      };
      vi.mocked(mockClient.get).mockResolvedValue(raw);

      const result = await getInstagramAccounts(mockClient, 'act_123');

      expect(mockClient.get).toHaveBeenCalledWith('/act_123/instagram_accounts', expect.any(Object));
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('mybrand');
    });
  });
});
