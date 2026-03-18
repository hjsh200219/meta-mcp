import type { Request, Response, NextFunction } from 'express';

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
    if (token !== authToken) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    next();
  };
}
