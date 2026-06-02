import { Request, Response, NextFunction } from 'express';
export declare class ApiError extends Error {
    status: number;
    code: string;
    message: string;
    details: any;
    constructor(status: number, code: string, message: string, details?: any);
}
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=error-handler.middleware.d.ts.map