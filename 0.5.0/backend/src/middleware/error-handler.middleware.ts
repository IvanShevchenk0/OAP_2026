import { Request, Response, NextFunction } from 'express';

// Узгоджена структура помилок API: кидати `new ApiError(status, code, message, details?)`
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

// Центральний обробник помилок Express. Повертає структуровану JSON відповідь
// для ApiError, або 500 для невідомих помилок.
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            status: err.status,
            title: err.code,
            detail: err.message,
            errors: Array.isArray(err.details) ? err.details : undefined
        });
    }

    // Логування для розробки; не виводити деталі клієнту
    console.error("Unhandled error:", err);
    return res.status(500).json({
        status: 500,
        title: "INTERNAL_SERVER_ERROR",
        detail: "Неочікувана помилка на сервері"
    });
};