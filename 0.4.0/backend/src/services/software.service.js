"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softwareService = void 0;
const software_repository_1 = require("../repositories/software.repository");
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
exports.softwareService = {
    // Логіка бізнес-рівня для роботи з ПЗ.
    // Отримати список з параметрами фільтрації, сортування та пагінації.
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
    // Небезпечний пошук через репозиторій (демонстрація SQL-ін'єкцій)
    searchUnsafe: async (q) => {
        return software_repository_1.softwareRepository.searchUnsafe(q);
    },
    create: async (dto) => {
        validateSoftwareDto(dto, false);
        return software_repository_1.softwareRepository.add(dto);
    },
    update: async (id, dto) => {
        await exports.softwareService.getById(id); // Перевірка чи існує
        validateSoftwareDto(dto, true);
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
// Перевірка DTO перед збереженням у базу
function validateSoftwareDto(dto, partial) {
    const errors = [];
    if (!partial || dto.name !== undefined) {
        if (!dto.name || dto.name.trim() === "") {
            errors.push({ field: "name", message: "Введіть назву ПЗ" });
        }
        else if (dto.name.length > 100) {
            errors.push({ field: "name", message: "Назва не має перевищувати 100 символів" });
        }
    }
    if (!partial || dto.version !== undefined) {
        if (!dto.version || dto.version.trim() === "") {
            errors.push({ field: "version", message: "Введіть версію" });
        }
        else if (dto.version.length > 50) {
            errors.push({ field: "version", message: "Версія не має перевищувати 50 символів" });
        }
    }
    if (!partial || dto.license !== undefined) {
        if (!dto.license || dto.license.trim() === "") {
            errors.push({ field: "license", message: "Оберіть тип ліцензії" });
        }
    }
    if (!partial || dto.seats !== undefined) {
        if (typeof dto.seats !== 'number' || !Number.isInteger(dto.seats) || dto.seats < 1 || dto.seats > 1000) {
            errors.push({ field: "seats", message: "Кількість місць повинна бути цілим числом від 1 до 1000" });
        }
    }
    if (dto.comment !== undefined && dto.comment !== null && dto.comment.length > 300) {
        errors.push({ field: "comment", message: "Коментар не може перевищувати 300 символів" });
    }
    if (errors.length > 0) {
        throw new error_handler_middleware_1.ApiError(400, "VALIDATION_ERROR", "Некоректні дані запиту", errors);
    }
}
//# sourceMappingURL=software.service.js.map