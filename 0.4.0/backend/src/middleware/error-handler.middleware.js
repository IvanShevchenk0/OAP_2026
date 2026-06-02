"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
class ApiError extends Error {
    status;
    code;
    message;
    details;
    constructor(status, code, message, details = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.message = message;
        this.details = details;
    }
}
exports.ApiError = ApiError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            status: err.status,
            title: err.code,
            detail: err.message,
            errors: Array.isArray(err.details) ? err.details : undefined
        });
    }
    console.error("Unhandled error:", err);
    return res.status(500).json({
        status: 500,
        title: "INTERNAL_SERVER_ERROR",
        detail: "Неочікувана помилка на сервері"
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error-handler.middleware.js.map