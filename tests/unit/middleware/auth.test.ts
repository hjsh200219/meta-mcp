import { describe, it, expect, vi } from 'vitest';
import { createAuthMiddleware } from '../../../src/middleware/auth.js';
import type { Request, Response, NextFunction } from 'express';

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    ...overrides,
  } as Request;
}

function createMockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

function createMockNext(): NextFunction {
  return vi.fn();
}

describe('createAuthMiddleware', () => {
  const validToken = 'secret-token-123';
  const middleware = createAuthMiddleware(validToken);

  it('Missing_Authorization헤더_401반환', () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Bearer token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('Malformed헤더_Bearer없음_401반환', () => {
    const req = createMockReq({ headers: { authorization: 'Basic xyz' } });
    const res = createMockRes();
    const next = createMockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Bearer token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('Invalid토큰_403반환', () => {
    const req = createMockReq({ headers: { authorization: 'Bearer wrong-token' } });
    const res = createMockRes();
    const next = createMockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('Valid토큰_next호출', () => {
    const req = createMockReq({ headers: { authorization: 'Bearer secret-token-123' } });
    const res = createMockRes();
    const next = createMockNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('Empty토큰_401반환', () => {
    const req = createMockReq({ headers: { authorization: 'Bearer ' } });
    const res = createMockRes();
    const next = createMockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing Bearer token' });
    expect(next).not.toHaveBeenCalled();
  });
});
