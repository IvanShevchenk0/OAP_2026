"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const software_controller_1 = require("../controllers/software.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// CRUD операції
router.get('/', software_controller_1.softwareController.getAll); // Отримати список
router.get('/summary', software_controller_1.softwareController.summary); // Aggregation
router.get('/search-unsafe', software_controller_1.softwareController.searchUnsafe); // Небезпечний пошук (демонстрація SQLi)
router.get('/search', software_controller_1.softwareController.search); // Безпечний пошук
router.get('/:id', auth_middleware_1.authMiddleware, software_controller_1.softwareController.getById); // Отримати один за ID
router.post('/', auth_middleware_1.authMiddleware, software_controller_1.softwareController.create); // Створити
router.put('/:id', auth_middleware_1.authMiddleware, software_controller_1.softwareController.update); // Оновити
router.delete('/:id', auth_middleware_1.authMiddleware, software_controller_1.softwareController.delete); // Видалити
exports.default = router;
//# sourceMappingURL=software.routes.js.map