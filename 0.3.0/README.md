# Backend SQLite API (0.3.0)

## Опис
Цей бекенд використовує SQLite для збереження даних у локальному файлі `backend/data/app.db`.
Міграції виконуються автоматично при старті сервера. Додатково є сценарій seed для наповнення тестовими записами.

## Запуск
1. Відкрити папку `0.3.0/backend`
2. Встановити залежності:
	 ```bash
	 npm install
	 ```
3. Запустити сервер у режимі розробки:
	 ```bash
	 npm run dev
	 ```
	 Сервер слухає на порту `3000` за адресою `http://localhost:3000`.

4. Або зібрати та запустити у production:
	 ```bash
	 npm run build
	 npm start
	 ```

## Ініціалізація бази даних
- Файл бази даних створюється автоматично при першому старті сервера.
- Шлях файлу: `0.3.0/backend/data/app.db`.
- Файл не зберігається в репозиторії завдяки `.gitignore`.

## Seed даних
Щоб наповнити БД тестовими записами, запустіть:
```bash
npm run seed
```

## Схема БД
### Таблиці
- `users`
	- `id` TEXT PRIMARY KEY
	- `name` TEXT NOT NULL
	- `email` TEXT NOT NULL UNIQUE
	- `role` TEXT NOT NULL CHECK(role IN ('admin', 'user'))

- `categories`
	- `id` TEXT PRIMARY KEY
	- `name` TEXT NOT NULL UNIQUE
	- `platform` TEXT

- `software`
	- `id` TEXT PRIMARY KEY
	- `name` TEXT NOT NULL
	- `version` TEXT NOT NULL
	- `license` TEXT NOT NULL
	- `seats` INTEGER NOT NULL CHECK(seats > 0)
	- `comment` TEXT
	- `owner_id` TEXT
	- `category_id` TEXT
	- FOREIGN KEY(`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
	- FOREIGN KEY(`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL

### Зв'язки
- `users` 1:N `software` через `software.owner_id`
- `categories` 1:N `software` через `software.category_id`

### Обмеження цілісності
- `NOT NULL` там, де поля обов'язкові.
- `UNIQUE` на `users.email` і `categories.name`.
- `CHECK(role IN ('admin', 'user'))` на таблиці `users`.
- `CHECK(seats > 0)` на таблиці `software`.

## Міграції
Міграції знаходяться у папці `backend/migrations/`:
- `001_init.sql` — створення базових таблиць
- `002_indexes.sql` — індекси
- `003_categories_platform.sql` — додавання поля `platform`
- `004_add_constraints.sql` — додавання CHECK-обмежень

Сервер застосовує тільки ті міграції, яких ще нема в таблиці `schema_migrations`.

## Ендпоінти
- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/users/:id/with-software`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

- `GET /api/software`
- `GET /api/software/:id`
- `POST /api/software`
- `PUT /api/software/:id`
- `DELETE /api/software/:id`
- `GET /api/software/export`
- `POST /api/software/import`
- `GET /api/software/summary`
- `GET /api/software/search?q=...`

## Приклади запитів
### 1) Сортування, фільтрація, пагінація (WHERE + ORDER BY + LIMIT)
```bash
curl "http://localhost:3000/api/software?license=Free&sortBy=name&sortOrder=desc&page=1&pageSize=5"
```
Цей запит виконує фільтрацію `WHERE license = 'Free'`, сортування `ORDER BY name DESC` та пагінацію через `LIMIT`/`OFFSET`.

### 2) Отримати користувача з його ПЗ
```bash
curl "http://localhost:3000/api/users/<userId>/with-software"
```

### 3) Створити користувача
```bash
curl -X POST http://localhost:3000/api/users \
	-H 'Content-Type: application/json' \
	-d '{"name":"Ivan","email":"ivan@example.com","role":"admin"}'
```

### 4) Створити категорію
```bash
curl -X POST http://localhost:3000/api/categories \
	-H 'Content-Type: application/json' \
	-d '{"name":"Office","platform":"Windows"}'
```

### Conflict example (409) — дублювання назви категорії
Якщо створити категорію з тією самою назвою вдруге, сервер поверне `409 Conflict`.
```bash
curl -X POST http://localhost:3000/api/categories \
	-H 'Content-Type: application/json' \
	-d '{"name":"Office","platform":"Windows"}'
```
Приклад очікуваної відповіді:
```json
{
	"error": {
		"code": "CONFLICT",
		"message": "Категорія з назвою Office вже існує"
	}
}
```
### 5) Створити програмне забезпечення
```bash
curl -X POST http://localhost:3000/api/software \
	-H 'Content-Type: application/json' \
	-d '{"name":"MyApp","version":"1.0.0","license":"Commercial","seats":10,"comment":"Тестове ПЗ","ownerId":"<userId>","categoryId":"<categoryId>"}'
```

> Для Postman: виберіть потрібний метод, вставте URL, у вкладці Body оберіть `raw` + `JSON`, і використайте ті самі JSON, що наведені вище.

## SQL-injection (демонстрація)
Є ендпоінт `GET /api/software/search?q=...`, який показово формує SQL через рядкову конкатенацію.
Це небезпечно, бо введення може змінити умову запиту.

Наприклад, якщо `q` встановити в:
```text
' OR '1'='1
```
це може повернути всі записи.

## Додаткові зауваження
- Файл SQLite зберігається локально, але не комітиться у репозиторій.
- Централізована обробка помилок повертає JSON з `code`, `message`, `details`.
- Логуються ключові події ініціалізації та застосування міграцій.

