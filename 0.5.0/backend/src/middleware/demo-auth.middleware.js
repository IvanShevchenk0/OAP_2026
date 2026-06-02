"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoAuth = void 0;
const users_repository_1 = require("../repositories/users.repository");
const error_handler_middleware_1 = require("./error-handler.middleware");
const demoAuth = async (req, res, next) => {
    const userId = req.header('X-Demo-UserId');
    // Якщо заголовок не передано — відхиляємо запит
    if (!userId) {
        throw new error_handler_middleware_1.ApiError(401, 'UNAUTHORIZED', 'Заголовок X-Demo-UserId обов’язковий');
    }
    // Гостьовий доступ без реального користувача
    if (userId === 'guest') {
        req.user = { id: 'guest', role: 'guest' };
        return next();
    }
    // Перевіряємо існування користувача у репозиторії
    const user = await users_repository_1.usersRepository.getById(userId);
    if (!user) {
        throw new error_handler_middleware_1.ApiError(401, 'UNAUTHORIZED', 'Невідомий X-Demo-UserId');
    }
    req.user = {
        id: user.id,
        role: user.role === 'admin' ? 'admin' : 'user'
    };
    next();
};
exports.demoAuth = demoAuth;
//# sourceMappingURL=demo-auth.middleware.js.map