# Лабораторна робота №5 — версія 0.5.0

## Опис

Проєкт `0.5.0` — односторінковий вебзастосунок (SPA) з TypeScript-фронтендом та TypeScript-Express бекендом. Сервер працює на SQLite через `sql.js`, підтримує CRUD для `software`, а також реалізує захищені сценарії: SQL Injection, IDOR, XSS та базове security hardening.

## Архітектура проекту

### Структура
- **`index.html`** — точка входу фронтенду; підключає `app.js`.
- **`app.js`** — фронтенд-логіка інтерфейсу, безпечний рендеринг, авторизація, робота з формами та таблицями.
- **`apiClient.ts`** — типізований HTTP-клієнт з обробкою помилок та таймаутів.
- **`shared/dtos.ts`** — спільні DTO для клієнта та сервера.
- **`backend/src`** — серверна частина на TypeScript; містить маршрути, контролери, сервіси, репозиторії, middleware та ініціалізацію БД.
- **`backend/data`** — файл SQLite для локального збереження даних.

## Особливості реалізації

- **TypeScript бекенд** (`backend/src`, `backend/tsconfig.json`).
- **SQL Injection**: `software.repository.ts` має демонстраційний небезпечний метод `searchUnsafe()`, решта запитів виконуються з `db.escape()` або підготовленою безпечною ескейп-логікою.
- **IDOR**: `auth.middleware.ts` підтримує `X-Demo-UserId` як спрощений currentUserId; `ensureSoftwareAccess()` у `software.service.ts` перевіряє доступ для `GET/PUT/DELETE`.
- **XSS**: `app.js` використовує `textContent` та `createElement()` для безпечного відображення користувацьких даних.
- **Security hardening**: `backend/src/index.ts` додає `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`.
- **Централізована обробка помилок**: `backend/src/middleware/error-handler.middleware.ts` повертає уніфікований JSON без стек-трейсу.
- **CORS**: налаштовано лише для `http://localhost:5173` та `http://127.0.0.1:5173`.

## Запуск проєкту

### Налаштування
1. Відкрити термінал у папці `0.5.0/backend`:
   ```bash
   cd 0.5.0/backend
   ```
2. Встановити залежності:
   ```bash
   npm install
   ```
3. Скомпілювати бекенд:
   ```bash
   npm run build
   ```
4. Запустити сервер:
   ```bash
   npm start
   ```

Сервер доступний за адресою: `http://localhost:3000`.

### Seed даних
Щоб наповнити БД тестовими записами:
```bash
npm run seed
```

## Запити для перевірки

### Перевірка сервера
```bash
curl http://localhost:3000/health
```

### Отримати список ПЗ
```bash
curl http://localhost:3000/api/v1/software
```

### Отримати запис за ID
```bash
curl http://localhost:3000/api/v1/software/<id>
```

### Створити запис
```bash
curl -X POST http://localhost:3000/api/v1/software \
  -H "Content-Type: application/json" \
  -d '{"name":"My App","version":"1.0","license":"Free","seats":5,"comment":"Demo","categoryId":"<categoryId>"}'
```

### Оновити запис
```bash
curl -X PUT http://localhost:3000/api/v1/software/<id> \
  -H "Content-Type: application/json" \
  -d '{"version":"1.1","seats":8}'
```

### Видалити запис
```bash
curl -X DELETE http://localhost:3000/api/v1/software/<id>
```

### Безпечний пошук
```bash
curl "http://localhost:3000/api/v1/software/search?q=editor"
```

### Демонстрація SQLi (небезпечний endpoint)
```bash
curl "http://localhost:3000/api/v1/software/search-unsafe?q=test' OR '1'='1"
```

## Сценарії безпеки

### Сценарій A — SQL Injection
- **Було**: уразливий метод `searchUnsafe()` у `backend/src/repositories/software.repository.ts` формував SQL шляхом конкатенації рядків з `q`.
- **Відтворення**: запит `GET /api/v1/software/search-unsafe?q=test' OR '1'='1` може повернути неправильний набір даних.
- **Виправлення**: додано параметризовану версію пошуку `GET /api/v1/software/search?q=...`; основні CRUD-операції тепер виконуються через параметризовані запити з `?` та масивом параметрів.
- **Перевірка**: запит `GET /api/v1/software/search?q=%27%20OR%20%271%27%3D%271` повертає лише рядки, які містять буквальний текст `' OR '1'='1`, а не всі записи.

### Сценарій B — IDOR
- **Було**: раніше контроль доступу на ресурсі `software` не перевіряв, чи є користувач власником.
- **Відтворення**: запит на `PUT /api/v1/software/<id>` з іншим `X-Demo-UserId` мав би дозволити змінити чужий запис.
- **Виправлення**: `auth.middleware.ts` визначає currentUser через `X-Demo-UserId`; `software.controller.ts` викликає `ensureSoftwareAccess(id, req.user)` у `update()` та `delete()`; `software.service.ts` перевіряє `user.role === 'admin' || user.id === item.ownerId`.
- **Перевірка**:
  - Без `X-Demo-UserId` → 401.
  - Невідомий користувач → 401.
  - Чужий користувач → 403.
  - Власник/адмін → 200/204.

### Сценарій Б — XSS
- **Було**: `app.js` використовував `innerHTML` для виведення користувацьких значень.
- **Відтворення**: введення `<script>alert(1)</script>` могло б виконатися в браузері.
- **Виправлення**: замість `innerHTML` використовується `textContent` та `createElement()` для безпечного рендерингу.
- **Перевірка**: шкідливі рядки відображаються як текст, не виконуються.

### Сценарій Г — Security Misconfiguration
- **Було**: відповіді не мали важливих безпечних заголовків.
- **Відтворення**: звичайний `curl http://localhost:3000/health` без заголовків безпеки.
- **Виправлення**: `backend/src/index.ts` додає заголовки `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`.
- **Перевірка**: `curl -i http://localhost:3000/health` показує ці заголовки.

## Опис структури проєкту

### Бекенд
- `backend/src/index.ts` — стартовий файл Express, CORS, безпечні заголовки, middleware, маршрути.
- `backend/src/db.ts` — wrapper для sql.js, ініціалізація бази, `escape()`.
- `backend/src/middleware/auth.middleware.ts` — обробка `Authorization` та `X-Demo-UserId`.
- `backend/src/middleware/error-handler.middleware.ts` — централізована обробка помилок.
- `backend/src/routes/software.routes.ts` — маршрути для `software`.
- `backend/src/controllers/software.controller.ts` — HTTP-контролери.
- `backend/src/services/software.service.ts` — бізнес-логіка, IDOR-перевірка, валідація.
- `backend/src/repositories/software.repository.ts` — CRUD/SQL-запити для таблиці `software`.

### Фронтенд
- `app.js` — логіка SPA, безпечне відображення, авторизація користувача, керування формами.
- `apiClient.ts` — HTTP-клієнт з типами та обробкою помилок.
- `shared/dtos.ts` — загальні типи між клієнтом і сервером.

## Додаткові рекомендації
- Для перевірки IDOR використовуйте `X-Demo-UserId`:
  ```bash
  curl -H "X-Demo-UserId: <userId>" http://localhost:3000/api/v1/software/<id>
  ```
- Для перевірки заголовків безпеки:
  ```bash
  curl -i http://localhost:3000/health
  ```
- Для seed-даних:
  ```bash
  npm run seed
  ```

## Контакти
- Проєкт створено для навчальної лабораторної роботи з безпеки веб-застосунків.
- Версія: `0.5.0`.


## Примітки щодо експлуатації

- Для коректної роботи клієнтської частини файл `index.html` повинен завантажувати зібраний модуль `dist/app.js`.
- Перед запуском клієнтської частини переконатись, що серверна частина запущена та доступна за адресою `http://localhost:3000`.
- При старті серверної частини автоматично виконується скрипт `seed`, який заповнює базу даних тестовими даними.