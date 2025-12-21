/* eslint-disable */
import type { Request, Response, NextFunction } from 'express';
export declare function enforceRole(requiredRole: string): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map