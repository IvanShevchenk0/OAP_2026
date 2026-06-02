"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const request_logging_middleware_1 = require("./middleware/request-logging.middleware");
const error_handler_middleware_1 = require("./middleware/error-handler.middleware");
const software_routes_1 = __importDefault(require("./routes/software.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const categories_routes_1 = __importDefault(require("./routes/categories.routes"));
// Імпортуємо ініціалізатор БД, щоб схема виконалась до старту сервера
require("./db");
const app = (0, express_1.default)();
const PORT = 3000;
// Дозволяємо запити з браузера
app.use((0, cors_1.default)());
// Парсинг JSON
app.use(express_1.default.json());
// Логування запитів
app.use(request_logging_middleware_1.requestLogger);
// Тестовий маршрут
app.get('/health', (req, res) => {
    res.status(200).json({ ok: true, message: "Сервер працює!" });
});
// Підключення маршрутів для ПЗ
app.use('/api/software', software_routes_1.default);
// Підключення маршрутів для користувачів
app.use('/api/users', users_routes_1.default);
// Підключення маршрутів для категорій
app.use('/api/categories', categories_routes_1.default);
// Обробка 404 (якщо маршрут не знайдений)
app.use((req, res, next) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Маршрут не знайдено" } });
});
// Централізований обробник помилок
app.use(error_handler_middleware_1.errorHandler);
app.listen(PORT, () => {
    console.log(`API started on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map