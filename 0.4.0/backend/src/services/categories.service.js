"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesService = void 0;
const categories_repository_1 = require("../repositories/categories.repository");
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
exports.categoriesService = {
    getAll: async () => {
        return categories_repository_1.categoriesRepository.getAll();
    },
    getById: async (id) => {
        const cat = await categories_repository_1.categoriesRepository.getById(id);
        if (!cat)
            throw new error_handler_middleware_1.ApiError(404, 'NOT_FOUND', `Категорію з id ${id} не знайдено`);
        return cat;
    },
    create: async (dto) => {
        if (!dto.name || dto.name.trim() === '') {
            throw new error_handler_middleware_1.ApiError(400, 'VALIDATION_ERROR', 'Назва категорії обов\'язкова');
        }
        return categories_repository_1.categoriesRepository.add(dto);
    },
    update: async (id, dto) => {
        await exports.categoriesService.getById(id);
        const updated = await categories_repository_1.categoriesRepository.update(id, dto);
        if (!updated)
            throw new error_handler_middleware_1.ApiError(500, 'INTERNAL_ERROR', 'Не вдалося оновити категорію');
        return updated;
    },
    delete: async (id) => {
        const ok = await categories_repository_1.categoriesRepository.delete(id);
        if (!ok)
            throw new error_handler_middleware_1.ApiError(404, 'NOT_FOUND', `Категорію з id ${id} не знайдено для видалення`);
    }
};
//# sourceMappingURL=categories.service.js.map