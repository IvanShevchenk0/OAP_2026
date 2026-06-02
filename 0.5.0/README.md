# Лабораторна робота №5 — версія 0.5.0

Ця версія реалізує клієнт-серверний SPA-застосунок на TypeScript з безпечним сервером на Express.js і вбудованою базою `sql.js`.

## Запуск

### Клієнт
```bash
cd "0.5.0"
npm install
npm run build
```
Відкрийте `index.html` у браузері або запустіть локальний сервер.

### Сервер
```bash
cd "0.5.0/backend"
npm install
npm run dev
```
Сервер доступний на `http://localhost:3000`.

## Основні захисні механізми

- Захист від SQL-ін'єкцій у пошуку через параметризовані запити.
- Контроль доступу до записів: лише адмін або власник можуть читати/редагувати/видаляти.
- HTTP-заголовки безпеки: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`.
- Заборона запитів з неавторизованих джерел за допомогою CORS whitelist.
- Безпечний фронтенд: динамічні значення вставляються через DOM, а не через `innerHTML`.

## API

### `software`
- `GET /api/v1/software`
- `GET /api/v1/software/search?q=...`
- `GET /api/v1/software/search-unsafe?q=...`
- `GET /api/v1/software/:id`
- `POST /api/v1/software`
- `PUT /api/v1/software/:id`
- `DELETE /api/v1/software/:id`

### `users`
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### `categories`
- `GET /api/categories`

## Приклад безпечного запиту

```bash
curl "http://localhost:3000/api/v1/software/search?q=office"
```

## Безпека: було / стало

- Було: пошук був вразливий до SQL-ін'єкцій. Стало: параметризований `search`.
- Було: доступ до записів не перевірявся за власником. Стало: `ensureSoftwareAccess` повертає `403 FORBIDDEN`.
- Було: небезпечне рендерення HTML. Стало: безпечний DOM-підхід.
