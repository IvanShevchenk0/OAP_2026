import { Request, Response, NextFunction } from 'express';
export type DemoUserRole = 'admin' | 'user' | 'guest';
export declare const demoAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=demo-auth.middleware.d.ts.map