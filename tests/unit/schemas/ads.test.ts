import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  ListAdsSchema,
  CreateAdSchema,
  GetAdSchema,
  UpdateAdSchema,
  DeleteAdSchema,
} from '../../../src/schemas/ads.js';

describe('ListAdsSchema', () => {
  const schema = z.object(ListAdsSchema);

  it('valid_params_필수필드포함_검증통과', () => {
    expect(schema.parse({ ad_set_id: '123' })).toEqual({ ad_set_id: '123' });
  });

  it('invalid_params_ad_set_id누락_검증실패', () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe('CreateAdSchema', () => {
  const schema = z.object(CreateAdSchema);

  it('valid_params_검증통과', () => {
    expect(
      schema.parse({
        ad_account_id: 'act_123',
        ad_set_id: '123',
        name: 'Test',
        creative_id: '456',
        status: 'ACTIVE',
      })
    ).toBeDefined();
  });

  it('invalid_params_status잘못된enum_검증실패', () => {
    expect(() =>
      schema.parse({
        ad_account_id: 'act_123',
        ad_set_id: '123',
        name: 'Test',
        creative_id: '456',
        status: 'DELETED',
      })
    ).toThrow();
  });
});

describe('GetAdSchema', () => {
  const schema = z.object(GetAdSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ ad_id: '123' })).toEqual({ ad_id: '123' });
  });
});

describe('UpdateAdSchema', () => {
  const schema = z.object(UpdateAdSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ ad_id: '123' })).toEqual({ ad_id: '123' });
  });
});

describe('DeleteAdSchema', () => {
  const schema = z.object(DeleteAdSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ ad_id: '123' })).toEqual({ ad_id: '123' });
  });
});
