"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesController = void 0;
const categories_service_1 = require("../services/categories.service");
exports.categoriesController = {
    getAll: async (req, res, next) => {
        try {
            const items = await categories_service_1.categoriesService.getAll();
            res.status(200).json(items);
        }
        catch (err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const item = await categories_service_1.categoriesService.getById(id);
            res.status(200).json(item);
        }
        catch (err) {
            next(err);
        }
    },
    create: async (req, res, next) => {
        try {
            const newItem = await categories_service_1.categoriesService.create(req.body);
            res.status(201).json(newItem);
        }
        catch (err) {
            next(err);
        }
    },
    update: async (req, res, next) => {
        try {
            const id = req.params.id;
            const updated = await categories_service_1.categoriesService.update(id, req.body);
            res.status(200).json(updated);
        }
        catch (err) {
            next(err);
        }
    },
    delete: async (req, res, next) => {
        try {
            const id = req.params.id;
            await categories_service_1.categoriesService.delete(id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    }
};
//# sourceMappingURL=categories.controller.js.map