# Лабораторна робота №3. Бекенд з SQLite

Проєкт у `0.3.0` використовує SQLite як файл-базу та підтримує міграції.
На фронтенді є форма додавання ПЗ з вибором категорії.

## Швидкий старт
1. Перейдіть у папку `0.3.0/backend`.
2. Встановіть залежності:

```bash
npm install
```

3. Запустіть сервер для розробки:

```bash
npm run dev
```

4. Або зберіть і запустіть продакшн:

```bash
npm run build
npm run start
```

Сервер доступний за адресою `http://localhost:3000`.

## Важливе
- На старті сервер автоматично створює базу даних `0.3.0/backend/data/app.db`.
- Дефолтні категорії `Editor`, `IDE`, `Platform` додаються автоматично, якщо їх ще нема.
- Файл бази `backend/data/app.db` додано до `.gitignore`.

## API
#### Software
- `GET /api/software`
- `GET /api/software/:id`
- `POST /api/software`
- `PUT /api/software/:id`
- `DELETE /api/software/:id`
- `GET /api/software/summary`
- `GET /api/software/search?q=...` - unsafe SQL search demo, показує ризик SQL-ін’єкцій при конкатенації запитів
- `GET /api/software/export` - JSON export, optional `license` filter
- `POST /api/software/import` - JSON import, max 10 items per request

#### Categories
- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

#### Users
- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/users/:id/with-software`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

## Схема БД
- `users`: `id PK`, `name NOT NULL`, `email NOT NULL UNIQUE`, `role NOT NULL`
- `categories`: `id PK`, `name NOT NULL UNIQUE`, `platform`
- `software`: `id PK`, `name NOT NULL`, `version NOT NULL`, `license NOT NULL`, `seats INTEGER NOT NULL`, `comment`, `owner_id FK`, `category_id FK`
- `schema_migrations`: лог виконаних міграцій

## Пошук і SQL-ін’єкція
- Запит `GET /api/software/search?q=...` демонструє небезпечну конкатенацію SQL.
- Наприклад: `q=' OR 1=1 --` може змінити логіку запиту, якщо не застосувати правильне екранування.
- У цьому проєкті використовується `db.escape(...)` у репозиторіях для утворення безпечних SQL-рядків, але цей endpoint показує, чому параметризовані запити є важливими.

## Зауваження
- Категорія у ПЗ передається через поле `categoryId`.
- Список категорій має містити `Editor`, `IDE`, `Platform`.
