# Проєкт 0.3.0 — Backend (SQLite)

Коротко
---
Цей бекенд — невеликий REST API на Node.js + TypeScript з локальною SQLite базою (`sql.js`). Схема застосовується через SQL-міграції при старті сервера. Файл бази зберігається локально у `data/app.db`.

Швидкий старт
---
1. Відкрийте папку `0.3.0/backend`
2. Встановіть залежності:
```bash
npm install
```
3. Запустіть у режимі розробки:
```bash
npm run dev
```
Сервер слухає `http://localhost:3000`.

Щоб збудувати і запустити production:
```bash
npm run build
npm start
```

Де знаходиться база
---
- Файл БД: `0.3.0/backend/data/app.db`
- Не додавайте `.db` у git — ігноруйте директорію/файл у `.gitignore` (наприклад `0.3.0/backend/data/` або `*.db`).

Ініціалізація та міграції
---
- Міграції: `0.3.0/backend/migrations/*.sql` (застосовуються автоматично при старті).
- Перед запуском HTTP-сервера схему ініціалізують (CREATE TABLE IF NOT EXISTS / runMigrations), щоб уникнути помилок при перших запитах.
- Потрібно включити `PRAGMA foreign_keys = ON;` для примушування зовнішніх ключів.

Seed (тестові дані)
---
Щоб наповнити БД прикладами:
```bash
npm run seed
```

Формат відповідей
---
- Списки: `{ "data": [...], "meta": { "total": N } }`
- Одиничні: `{ "data": {...} }`
- Помилки: `{ "error": { "code": "...", "message": "...", "details": [...] } }` (re-throw `ApiError` у сервісі → централізований middleware повертає JSON)

DTO і структура коду
---
- DTO: `src/dtos/*.ts` (`users.dto.ts`, `software.dto.ts`, `category.dto.ts`)
- Архітектура: routes → controllers → services → repositories

Основні ендпоінти
---
- Users: `GET /api/users`, `GET /api/users/:id`, `GET /api/users/:id/with-software`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`
- Categories: `GET /api/categories`, `GET /api/categories/:id`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`
- Software: `GET /api/software`, `GET /api/software/:id`, `POST /api/software`, `PUT /api/software/:id`, `DELETE /api/software/:id`
- Додатково: `GET /api/software/export`, `POST /api/software/import`, `GET /api/software/summary`, `GET /api/software/search?q=...` (демонстрація SQLi)

JOIN та агрегації
---
- JOIN приклад: `GET /api/users/:id/with-software` повертає користувача та пов'язане ПО (реалізація в `users.repository.getWithSoftware`).
- Агрегація: `GET /api/software/summary` повертає `{ total, sumSeats, avgSeats }` (реалізація в `software.repository.getSummary`).

Приклади `curl`
---
1) Фільтрація + сортування + пагінація (WHERE + ORDER BY + LIMIT):
```bash
curl "http://localhost:3000/api/software?license=Free&sortBy=name&sortOrder=desc&page=1&pageSize=5"
```

2) Отримати користувача з його ПЗ (JOIN):
```bash
curl "http://localhost:3000/api/users/<userId>/with-software"
```

3) Створити категорію (можливий 409 при дублі):
```bash
curl -X POST http://localhost:3000/api/categories \
  -H 'Content-Type: application/json' \
  -d '{"name":"Office","platform":"Windows"}'
```

4) Приклад 409 Conflict (дубль назви категорії):
```json
{
  "error": { "code": "CONFLICT", "message": "Категорія з назвою Office вже існує" }
}
```

5) Імпорт JSON (макс. 10 елементів):
```bash
curl -X POST http://localhost:3000/api/software/import \
  -H 'Content-Type: application/json' \
  -d '{"items": [{"name":"MyApp","version":"1.0","license":"Commercial","seats":10}] }'
```

SQL‑injection (демонстрація)
---
- Небезпечний endpoint: `GET /api/software/search?q=...` формує SQL через конкатенацію у `software.repository.searchUnsafe`.
- Чому це небезпечно: зловмисний ввід може змінити логіку WHERE, наприклад `q=' OR '1'='1` може повернути всі записи.
- Використовуйте параметризовані запити або `db.escape(...)` для уникнення ін'єкцій.

Чому `.db` не в git
---
- Файли БД — бінарні, часто змінюються, можуть містити приватні/тестові дані і викликають конфлікти при мерджах. Зберігайте міграції (`migrations/*.sql`) та seed-скрипти у репо, а сам файл ігноруйте.

Корисні команди
---
```bash
# видалити локальну БД, щоб застосувались міграції заново
rm 0.3.0/backend/data/app.db

# запустити seed
cd 0.3.0/backend && npm run seed

# запустити сервер (dev)
cd 0.3.0/backend && npm run dev
```

Де шукати код
---
- Ініціалізація БД: `src/db.ts`
- Міграції: `src/migrations/runMigrations.ts` + `backend/migrations/*.sql`
- Репозиторії: `src/repositories/*` (CRUD + SQL)
- Сервіси: `src/services/*` (валідація, бізнес-логіка)
- Контролери/маршрути: `src/controllers/*`, `src/routes/*`

Якщо потрібно — можу:
- додати розгорнуті приклади Postman
- додати unit/integration test для імпорту/409/404 сценаріїв

---

