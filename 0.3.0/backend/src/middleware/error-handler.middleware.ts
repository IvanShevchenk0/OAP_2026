import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
    constructor(
        public status: number,
        public code: string,
        public message: string,
        public details: any = null
    ) {
        super(message);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            error: {
                code: err.code,
                message: err.message,
                details: err.details
            }
        });
    }

    console.error("Unhandled error:", err);
    return res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Неочікувана помилка на сервері"
        }
    });
};