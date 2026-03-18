import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { CreateAdCreativeSchema, GetAdCreativeSchema } from '../../../src/schemas/creatives.js';

describe('CreateAdCreativeSchema', () => {
  const schema = z.object(CreateAdCreativeSchema);

  it('valid_params_필수필드포함_검증통과', () => {
    expect(
      schema.parse({
        ad_account_id: 'act_123',
        name: 'Test',
        instagram_actor_id: 'ig_123',
        page_id: 'page_123',
        message: 'Hello',
        image_url: 'https://example.com/image.jpg',
      })
    ).toBeDefined();
  });

  it('invalid_params_image_url잘못된URL_검증실패', () => {
    expect(() =>
      schema.parse({
        ad_account_id: 'act_123',
        name: 'Test',
        instagram_actor_id: 'ig_123',
        page_id: 'page_123',
        message: 'Hello',
        image_url: 'not-a-url',
      })
    ).toThrow();
  });

  it('invalid_params_필수필드누락_검증실패', () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe('GetAdCreativeSchema', () => {
  const schema = z.object(GetAdCreativeSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ creative_id: '123' })).toEqual({ creative_id: '123' });
  });
});
