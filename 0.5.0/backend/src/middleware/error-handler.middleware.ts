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
            status: err.status,
            title: err.code,
            detail: err.message,
            errors: Array.isArray(err.details) ? err.details : undefined
        });
    }

    console.error("Unhandled error:", err);

    const response: any = {
        status: 500,
        title: "INTERNAL_SERVER_ERROR",
        detail: "Неочікувана помилка на сервері"
    };

    if (process.env.NODE_ENV !== 'production') {
        response.debug = err?.message;
        response.stack = err?.stack;
    }

    return res.status(500).json(response);
};