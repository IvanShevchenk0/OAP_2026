"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softwareController = void 0;
const software_service_1 = require("../services/software.service");
exports.softwareController = {
    // Контролер для роботи з переліком програмного забезпечення
    // Отримати весь список (GET /api/software)
    getAll: async (req, res, next) => {
        try {
            const license = req.query.license;
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : undefined;
            const sortBy = req.query.sortBy;
            const sortOrder = req.query.sortOrder;
            const query = {};
            if (license)
                query.license = license;
            if (page !== undefined)
                query.page = page;
            if (pageSize !== undefined)
                query.pageSize = pageSize;
            if (sortBy)
                query.sortBy = sortBy;
            if (sortOrder)
                query.sortOrder = sortOrder;
            const result = await software_service_1.softwareService.getAll(query);
            res.status(200).json({ data: result.items, meta: { total: result.total } });
        }
        catch (error) {
            next(error);
        }
    },
    // Отримання одного елемента за ID (GET /api/software/:id)
    getById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const item = await software_service_1.softwareService.getById(id);
            res.status(200).json({ data: item });
        }
        catch (error) {
            next(error);
        }
    },
    // Створення нового запису (POST /api/software)
    create: async (req, res, next) => {
        try {
            const newItem = await software_service_1.softwareService.create(req.body);
            res.status(201).json({ data: newItem });
        }
        catch (error) {
            next(error);
        }
    },
    // Оновлення запису (PUT /api/software/:id)
    update: async (req, res, next) => {
        try {
            const id = req.params.id;
            const updatedItem = await software_service_1.softwareService.update(id, req.body);
            res.status(200).json({ data: updatedItem });
        }
        catch (error) {
            next(error);
        }
    },
    // Видалення запису (DELETE /api/software/:id)
    delete: async (req, res, next) => {
        try {
            const id = req.params.id;
            await software_service_1.softwareService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
    // Aggregation endpoint
    summary: async (req, res, next) => {
        try {
            const summary = await software_service_1.softwareService.getSummary();
            res.status(200).json({ data: summary });
        }
        catch (err) {
            next(err);
        }
    },
    // Небезпечний пошук (демонстрація SQL-ін'єкцій)
    searchUnsafe: async (req, res, next) => {
        try {
            const q = req.query.q || '';
            const items = await software_service_1.softwareService.searchUnsafe(q);
            res.status(200).json({ data: items, meta: { total: items.length } });
        }
        catch (err) {
            next(err);
        }
    }
};
//# sourceMappingURL=software.controller.js.map