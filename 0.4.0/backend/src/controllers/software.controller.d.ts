import { Request, Response, NextFunction } from 'express';
export declare const softwareController: {
    getAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    summary: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    searchUnsafe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=software.controller.d.ts.map