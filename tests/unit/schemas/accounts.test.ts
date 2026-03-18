import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { GetAdAccountsSchema, GetInstagramAccountsSchema } from '../../../src/schemas/accounts.js';

describe('GetAdAccountsSchema', () => {
  const schema = z.object(GetAdAccountsSchema);

  it('valid_params_빈객체_검증통과', () => {
    expect(schema.parse({})).toEqual({});
  });

  it('valid_params_after포함_검증통과', () => {
    expect(schema.parse({ after: 'cursor' })).toEqual({ after: 'cursor' });
  });
});

describe('GetInstagramAccountsSchema', () => {
  const schema = z.object(GetInstagramAccountsSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ ad_account_id: 'act_123' })).toEqual({
      ad_account_id: 'act_123',
    });
  });

  it('invalid_params_ad_account_id누락_검증실패', () => {
    expect(() => schema.parse({})).toThrow();
  });
});
