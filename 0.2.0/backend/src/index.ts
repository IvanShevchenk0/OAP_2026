import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/request-logging.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import softwareRoutes from './routes/software.routes'; 
import usersRoutes from './routes/users.routes';

const app = express();
const PORT = 3000;

// Дозволяємо запити з браузера
app.use(cors());

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

// Підключення маршрутів для користувачів
app.use('/api/users', usersRoutes);

// Обробка 404 (якщо маршрут не знайдений)
app.use((req, res, next) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Маршрут не знайдено" } });
});

// Централізований обробник помилок
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`API started on http://localhost:${PORT}`);
});