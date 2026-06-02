"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const router = (0, express_1.Router)();
// CRUD операції 
router.get('/', users_controller_1.usersController.getAll);
router.get('/:id', users_controller_1.usersController.getById);
router.get('/:id/with-software', users_controller_1.usersController.getWithSoftware);
router.post('/', users_controller_1.usersController.create);
router.put('/:id', users_controller_1.usersController.update);
router.delete('/:id', users_controller_1.usersController.delete);
exports.default = router;
//# sourceMappingURL=users.routes.js.map