import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAdCreative, getAdCreative } from '../../../src/meta-api/creatives.js';
import type { MetaApiClient } from '../../../src/meta-api/types.js';

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
} as unknown as MetaApiClient;

describe('creatives', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAdCreative', () => {
    it('create_경로및파라미터검증', async () => {
      vi.mocked(mockClient.post).mockResolvedValue({ id: 'cr_new' });

      const result = await createAdCreative(mockClient, 'act_123', {
        name: 'Creative 1',
        object_story_spec: {
          page_id: 'page1',
          instagram_actor_id: 'ig1',
          link_data: { image_url: 'https://example.com/img.jpg', message: 'Hello' },
        },
      });

      expect(mockClient.post).toHaveBeenCalledWith('/act_123/adcreatives', expect.objectContaining({
        name: 'Creative 1',
        object_story_spec: expect.objectContaining({
          page_id: 'page1',
          instagram_actor_id: 'ig1',
        }),
      }));
      expect(result).toEqual({ id: 'cr_new' });
    });
  });

  describe('getAdCreative', () => {
    it('get_단일크리에이티브반환', async () => {
      const creative = { id: 'cr1', name: 'Test Creative', object_story_spec: {} };
      vi.mocked(mockClient.get).mockResolvedValue(creative);

      const result = await getAdCreative(mockClient, 'cr1');

      expect(mockClient.get).toHaveBeenCalledWith('/cr1', expect.any(Object));
      expect(result).toEqual(creative);
    });
  });
});
