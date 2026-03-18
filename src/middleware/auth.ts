import { timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function createAuthMiddleware(authToken: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing Bearer token' });
      return;
    }
    const token = authHeader.slice(7);
    if (!token) {
      res.status(401).json({ error: 'Missing Bearer token' });
      return;
    }
    if (!safeCompare(token, authToken)) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    next();
  };
}
