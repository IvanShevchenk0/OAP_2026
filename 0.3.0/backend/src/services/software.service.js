"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softwareService = void 0;
const software_repository_1 = require("../repositories/software.repository");
const categories_repository_1 = require("../repositories/categories.repository");
const users_repository_1 = require("../repositories/users.repository");
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
    exportData: async (query) => {
        return software_repository_1.softwareRepository.getExportData({ license: query?.license });
    },
    importItems: async (items) => {
        if (!Array.isArray(items)) {
            throw new error_handler_middleware_1.ApiError(400, 'VALIDATION_ERROR', 'Очікується масив items для імпорту');
        }
        if (items.length > 10) {
            throw new error_handler_middleware_1.ApiError(400, 'VALIDATION_ERROR', 'Максимум 10 елементів можна імпортувати за раз');
        }
        const seen = new Set();
        const created = [];
        for (const [index, rawItem] of items.entries()) {
            if (typeof rawItem !== 'object' || rawItem === null) {
                throw new error_handler_middleware_1.ApiError(400, 'VALIDATION_ERROR', `Елемент ${index} повинен бути об'єктом`);
            }
            const dto = {
                name: rawItem.name,
                version: rawItem.version,
                license: rawItem.license,
                seats: Number(rawItem.seats),
                comment: typeof rawItem.comment === 'string' ? rawItem.comment : '',
                ownerId: typeof rawItem.ownerId === 'string' ? rawItem.ownerId : null,
                categoryId: typeof rawItem.categoryId === 'string' ? rawItem.categoryId : null,
            };
            validateSoftwareDto(dto);
            const uniqueKey = `${dto.name.trim().toLowerCase()}|${dto.version.trim().toLowerCase()}`;
            if (seen.has(uniqueKey)) {
                throw new error_handler_middleware_1.ApiError(400, 'VALIDATION_ERROR', `Дубликат у запиті імпорту: '${dto.name}' версія '${dto.version}'`);
            }
            seen.add(uniqueKey);
            if (await software_repository_1.softwareRepository.existsByNameAndVersion(dto.name, dto.version)) {
                throw new error_handler_middleware_1.ApiError(409, 'CONFLICT', `ПЗ з назвою '${dto.name}' та версією '${dto.version}' вже існує`);
            }
            if (dto.ownerId) {
                const owner = await users_repository_1.usersRepository.getById(dto.ownerId);
                if (!owner) {
                    throw new error_handler_middleware_1.ApiError(400, 'VALIDATION_ERROR', `Власник з id ${dto.ownerId} не знайдено`);
                }
            }
            if (dto.categoryId) {
                const category = await categories_repository_1.categoriesRepository.getById(dto.categoryId);
                if (!category) {
                    throw new error_handler_middleware_1.ApiError(400, 'VALIDATION_ERROR', `Категорію з id ${dto.categoryId} не знайдено`);
                }
            }
            const createdItem = await software_repository_1.softwareRepository.add(dto);
            created.push(createdItem);
        }
        return created;
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
// Перевірка DTO перед збереженням у базу
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