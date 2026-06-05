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

## Аутентифікація (нове)

- Ендпойнти: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`.
- Після входу сервер повертає об'єкт `{ user, token }` — JWT потрібно зберегти на клієнті (в цьому репозиторії використовується `sessionStorage.authToken`).
- Токени підписуються HMAC-SHA256; TTL — 24 години. Паролі хешуються PBKDF2 (сіль + ітерації).
- Захищені маршрути вимагають заголовка `Authorization: Bearer <token>`; middleware встановлює `req.user = { id, role }`.
- Ролі: `user` та `admin`. Маршрути для адміністраторів захищені middleware `requireAdmin`.
- Logout додає токен у тимчасовий чорний список (ревокація). Для production-рішення рекомендується використовувати Redis/спільне сховище для blacklist та rate-limit.
- Простий захист від brute-force: після 5 невдалих спроб логіну для `email:ip` — блокування 15 хв.

## Як протестувати автентифікацію

1) Наповнити базу і запустити сервер:
```bash
cd "0.5.0/backend"
npm install
npm run seed
npm run dev
```

2) Логін (отримаєте `token`):
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"ivan@example.com","password":"admin123"}'
```

3) Виклик захищеного ресурсa з токеном:
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/v1/software
```

4) Логаут (ревокація):
```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/auth/logout
```

5) Перевірка прав доступу (IDOR): спробуйте отримати/редагувати запис, що належить іншому користувачу — без прав повинно бути `403 FORBIDDEN`, для admin — доступ дозволено.

Якщо потрібно, я можу додати в README приклади запитів з `jq` для парсингу відповіді або скрипт для автоматичної перевірки авторизації.
