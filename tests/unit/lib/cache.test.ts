import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TtlCache } from '../../../src/lib/cache.js';

describe('TtlCache', () => {
  let cache: TtlCache;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new TtlCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('set후get_데이터반환', () => {
    cache.set('key1', { name: 'test' }, 60_000);
    const result = cache.get<{ name: string }>('key1');
    expect(result).toEqual({ name: 'test' });
  });

  it('TTL만료후get_undefined반환', () => {
    cache.set('key1', 'value', 1_000);
    vi.advanceTimersByTime(1_001);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('존재하지않는키_undefined반환', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('invalidate_패턴매칭캐시삭제', () => {
    cache.set('list_campaigns:act_123', [1, 2], 60_000);
    cache.set('list_campaigns:act_456', [3, 4], 60_000);
    cache.set('get_campaign:123', { id: '123' }, 60_000);

    cache.invalidate('list_campaigns');

    expect(cache.get('list_campaigns:act_123')).toBeUndefined();
    expect(cache.get('list_campaigns:act_456')).toBeUndefined();
    expect(cache.get('get_campaign:123')).toEqual({ id: '123' });
  });

  it('TTL내재설정_새값반환', () => {
    cache.set('key1', 'old', 60_000);
    cache.set('key1', 'new', 60_000);
    expect(cache.get('key1')).toBe('new');
  });
});
