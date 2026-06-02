"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_controller_1 = require("../controllers/categories.controller");
const router = (0, express_1.Router)();
router.get('/', categories_controller_1.categoriesController.getAll);
router.post('/', categories_controller_1.categoriesController.create);
router.get('/:id', categories_controller_1.categoriesController.getById);
router.put('/:id', categories_controller_1.categoriesController.update);
router.delete('/:id', categories_controller_1.categoriesController.delete);
exports.default = router;
//# sourceMappingURL=categories.routes.js.map