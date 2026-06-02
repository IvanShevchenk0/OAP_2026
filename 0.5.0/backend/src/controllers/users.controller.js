"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const users_service_1 = require("../services/users.service");
exports.usersController = {
    getAll: async (req, res, next) => {
        try {
            const users = await users_service_1.usersService.getAll();
            res.status(200).json({ data: users, meta: { total: users.length } });
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const user = await users_service_1.usersService.getById(id);
            res.status(200).json({ data: user });
        }
        catch (error) {
            next(error);
        }
    },
    getWithSoftware: async (req, res, next) => {
        try {
            const id = req.params.id;
            const result = await users_service_1.usersService.getWithSoftware(id);
            res.status(200).json({ data: result });
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const newUser = await users_service_1.usersService.create(req.body);
            res.status(201).json({ data: newUser });
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const id = req.params.id;
            const updatedUser = await users_service_1.usersService.update(id, req.body);
            res.status(200).json({ data: updatedUser });
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            const id = req.params.id;
            await users_service_1.usersService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=users.controller.js.map