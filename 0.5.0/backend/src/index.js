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
// Express middleware та маршрути налаштовуються нижче
// Конфігурація CORS: дозволені конкретні хости для фронтенд-запитів
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-Demo-UserId'],
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
// Парсер JSON для всіх вхідних запитів
app.use(express_1.default.json());
// Додаткові заголовки безпеки для захисту від типових атак
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});
// Логування запитів
app.use(request_logging_middleware_1.requestLogger);
// Тестовий маршрут
app.get('/health', (req, res) => {
    res.status(200).json({ ok: true, message: "Сервер працює!" });
});
// Підключення маршрутів для ПЗ
app.use('/api/software', software_routes_1.default);
app.use('/api/v1/software', software_routes_1.default);
// Підключення маршрутів для користувачів
app.use('/api/users', users_routes_1.default);
app.use('/api/v1/users', users_routes_1.default);
// Підключення маршрутів для категорій
app.use('/api/categories', categories_routes_1.default);
app.use('/api/v1/categories', categories_routes_1.default);
// Обробка 404 (якщо маршрут не знайдений)
app.use((req, res, next) => {
    res.status(404).json({
        status: 404,
        title: "NOT_FOUND",
        detail: "Маршрут не знайдено"
    });
});
// Централізований обробник помилок
app.use(error_handler_middleware_1.errorHandler);
app.listen(PORT, () => {
    console.log(`API started on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map