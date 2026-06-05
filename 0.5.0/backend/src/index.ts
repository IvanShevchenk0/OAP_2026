import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/request-logging.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import softwareRoutes from './routes/software.routes'; 
import usersRoutes from './routes/users.routes';
import categoriesRoutes from './routes/categories.routes';
import authRoutes from './routes/auth.routes';
// Імпортуємо ініціалізатор БД, щоб схема виконалась до старту сервера
import './db';

const app = express();
const PORT = 3000;

// Express middleware та маршрути налаштовуються нижче

// Конфігурація CORS: дозволені конкретні хости для фронтенд-запитів
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

// Парсер JSON для всіх вхідних запитів
app.use(express.json());

// Додаткові заголовки безпеки для захисту від типових атак
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

// Логування запитів
app.use(requestLogger);

// Тестовий маршрут
app.get('/health', (req, res) => {
    res.status(200).json({ ok: true, message: "Сервер працює!" });
});

// Підключення маршрутів для ПЗ
app.use('/api/software', softwareRoutes);
app.use('/api/v1/software', softwareRoutes);

// Підключення маршрутів для авторизації
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);

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