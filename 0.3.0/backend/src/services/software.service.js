"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softwareService = void 0;
const software_repository_1 = require("../repositories/software.repository");
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
exports.softwareService = {
    // Фільтрація, сортування та пагінація (delegated to SQL repository)
    getAll: async (query) => {
        const options = {};
        if (query?.license)
            options.license = query.license;
        if (query?.sortBy)
            options.sortBy = query.sortBy;
        if (query?.sortOrder)
            options.sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
        if (query?.page && query?.pageSize) {
            options.limit = query.pageSize;
            options.offset = (query.page - 1) * query.pageSize;
        }
        return software_repository_1.softwareRepository.getAll(options);
    },
    getById: async (id) => {
        const item = await software_repository_1.softwareRepository.getById(id);
        if (!item) {
            throw new error_handler_middleware_1.ApiError(404, "NOT_FOUND", `ПЗ з id ${id} не знайдено`);
        }
        return item;
    },
    getSummary: async () => {
        return software_repository_1.softwareRepository.getSummary();
    },
    // Unsafe search delegated to repository (demonstration only)
    searchUnsafe: async (q) => {
        return software_repository_1.softwareRepository.searchUnsafe(q);
    },
    create: async (dto) => {
        validateSoftwareDto(dto);
        return software_repository_1.softwareRepository.add(dto);
    },
    update: async (id, dto) => {
        await exports.softwareService.getById(id); // Перевірка чи існує
        const updatedItem = await software_repository_1.softwareRepository.update(id, dto);
        if (!updatedItem) {
            throw new error_handler_middleware_1.ApiError(500, "INTERNAL_ERROR", "Не вдалося оновити запис");
        }
        return updatedItem;
    },
    delete: async (id) => {
        const isDeleted = await software_repository_1.softwareRepository.delete(id);
        if (!isDeleted) {
            throw new error_handler_middleware_1.ApiError(404, "NOT_FOUND", `ПЗ з id ${id} не знайдено для видалення`);
        }
    }
};
function validateSoftwareDto(dto) {
    const errors = [];
    if (!dto.name || dto.name.trim() === "") {
        errors.push({ field: "name", message: "Введіть назву ПЗ" });
    }
    if (!dto.version || dto.version.trim() === "") {
        errors.push({ field: "version", message: "Введіть версію" });
    }
    if (!dto.license) {
        errors.push({ field: "license", message: "Оберіть тип ліцензії" });
    }
    if (typeof dto.seats !== 'number' || dto.seats < 1) {
        errors.push({ field: "seats", message: "Введіть число від 1" });
    }
    if (errors.length > 0) {
        throw new error_handler_middleware_1.ApiError(400, "VALIDATION_ERROR", "Некоректні дані запиту", errors);
    }
}
//# sourceMappingURL=software.service.js.map