import { verifyFirebaseToken } from '../utils/firebase.js';
import type { Request, Response, NextFunction } from 'express';

export function enforceRole(requiredRole: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
  const user = await verifyFirebaseToken(token as string);
    if (!user.roles.includes(requiredRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}
