import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/request-logging.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import softwareRoutes from './routes/software.routes'; 
import usersRoutes from './routes/users.routes';
import categoriesRoutes from './routes/categories.routes';
// Імпортуємо ініціалізатор БД, щоб схема виконалась до старту сервера
import './db';

const app = express();
const PORT = 3000;

// Express middleware та маршрути налаштовуються нижче

// Дозволяємо запити з браузера з фронтенд-порту
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Парсинг JSON
app.use(express.json());

// Логування запитів
app.use(requestLogger);

// Тестовий маршрут
app.get('/health', (req, res) => {
    res.status(200).json({ ok: true, message: "Сервер працює!" });
});

// Підключення маршрутів для ПЗ
app.use('/api/software', softwareRoutes);
app.use('/api/v1/software', softwareRoutes);

// Підключення маршрутів для користувачів
app.use('/api/users', usersRoutes);
app.use('/api/v1/users', usersRoutes);

// Підключення маршрутів для категорій
app.use('/api/categories', categoriesRoutes);
app.use('/api/v1/categories', categoriesRoutes);

// Обробка 404 (якщо маршрут не знайдений)
app.use((req, res, next) => {
    res.status(404).json({
        status: 404,
        title: "NOT_FOUND",
        detail: "Маршрут не знайдено"
    });
});

// Централізований обробник помилок
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`API started on http://localhost:${PORT}`);
});