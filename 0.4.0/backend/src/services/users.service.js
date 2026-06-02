"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const users_repository_1 = require("../repositories/users.repository");
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
exports.usersService = {
    getAll: async () => {
        return users_repository_1.usersRepository.getAll();
    },
    getById: async (id) => {
        const user = await users_repository_1.usersRepository.getById(id);
        if (!user) {
            throw new error_handler_middleware_1.ApiError(404, "NOT_FOUND", `Користувача з id ${id} не знайдено`);
        }
        return user;
    },
    create: async (dto) => {
        validateUserDto(dto); // Валідація перед збереженням
        return users_repository_1.usersRepository.add(dto);
    },
    update: async (id, dto) => {
        await exports.usersService.getById(id); // Перевірка, чи існує користувач перед оновленням
        const updatedUser = await users_repository_1.usersRepository.update(id, dto);
        if (!updatedUser) {
            throw new error_handler_middleware_1.ApiError(500, "INTERNAL_ERROR", "Не вдалося оновити користувача");
        }
        return updatedUser;
    },
    delete: async (id) => {
        const isDeleted = await users_repository_1.usersRepository.delete(id);
        if (!isDeleted) {
            throw new error_handler_middleware_1.ApiError(404, "NOT_FOUND", `Користувача з id ${id} не знайдено для видалення`);
        }
    },
    // Повертає користувача та його ПЗ (JOIN)
    getWithSoftware: async (id) => {
        const res = await users_repository_1.usersRepository.getWithSoftware(id);
        if (!res)
            throw new error_handler_middleware_1.ApiError(404, 'NOT_FOUND', `Користувача з id ${id} не знайдено`);
        return res;
    }
};
// Перевірка даних користувача
function validateUserDto(dto) {
    const errors = [];
    if (!dto.name || dto.name.trim().length < 2) {
        errors.push({ field: "name", message: "Ім'я обов'язкове і має бути не менше 2 символів" });
    }
    // Перевірка на наявність @ в email
    if (!dto.email || !dto.email.includes('@')) {
        errors.push({ field: "email", message: "Введіть коректний email" });
    }
    // Роль має бути тільки з набору допустимих значень
    if (!dto.role || (dto.role !== 'admin' && dto.role !== 'user')) {
        errors.push({ field: "role", message: "Роль має бути 'admin' або 'user'" });
    }
    if (errors.length > 0) {
        throw new error_handler_middleware_1.ApiError(400, "VALIDATION_ERROR", "Некоректні дані користувача", errors);
    }
}
//# sourceMappingURL=users.service.js.map