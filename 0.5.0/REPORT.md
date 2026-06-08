REPORT - Вразливості та виправлення (версія 0.5.0)

Коротко
- Проект: 0.5.0/backend (TypeScript)
- Реалізовано та задокументовано чотири сценарії: SQLi (A), XSS (B), IDOR (C) та Security Misconfiguration (D).
- Внесені зміни у код для параметризації запитів, безпечного фронтенд-рендерингу, контролю доступу та додаткових безпечних HTTP-заголовків.

1) Сценарій A — SQL Injection (SQLi)
- Де відтворюється: Ендпойнт демонстраційного небезпечного пошуку: GET /software/search-unsafe
  Файли: backend/src/repositories/software.repository.ts (поля: `searchUnsafe`, `search`), backend/src/db.ts
- Було: Функція `searchUnsafe` формувала SQL шляхом конкатенації рядків: `... WHERE name LIKE '%${q}%' ...`. Також багато репозиторіїв використовували `db.escape(...)` та інтерполювали значення у SQL, що ускладнювало захист від ін'єкцій.
- Відтворення: виклик `GET /software/search-unsafe?q=abc' OR '1'='1` демонстрував, що запит може обробити ін'єкційний рядок як частину SQL, що призводить до повернення додаткових рядків.
- Виправлення: додано параметризовані запити у `db` та оновлено основні репозиторії (`software.repository.ts`, `categories.repository.ts`, `migrations/runMigrations.ts`) для використання плейсхолдерів `?`. Додано безпечний маршрут `GET /api/v1/software/search?q=...`, а `searchUnsafe` збережено як навчальний демо-приклад.
- Перевірка: запит `GET /software/search?q=%27%20OR%20%271%27%3D%271` тепер обробляється без SQL-ін'єкції і повертає лише коректні результати за строковим значенням. Файли для перевірки: [backend/src/repositories/software.repository.ts](backend/src/repositories/software.repository.ts), [backend/src/db.ts](backend/src/db.ts)

2) Сценарій B — XSS (відбитий / збережений)
- Де відтворюється: фронтенд при рендерингу деталей обраного ПЗ та виведенні поточного користувача.
  Файли: `0.5.0/app.js`, `0.5.0/dist/app.js`.
- Було: рядки з даними від користувача та бази даних вставлялися у DOM через `innerHTML` та шаблонну інтерполяцію, наприклад у `renderItemDetails()` та `checkAuth()`.
- Відтворення: шкідливий текст, наприклад `<script>alert(1)</script>`, може інтерпретуватися як HTML/JS при виведенні у браузері.
- Виправлення: замінено небезпечні вставки на безпечне створення DOM-елементів та `textContent` у `renderItemDetails()` і при відображенні користувача. Зокрема, `detailsContainer.innerHTML` було замінено на побудову `div` + `strong` + `textNode`, а `userEmailDisplay.innerHTML` — на `createElement('span')`/`createElement('strong')`.
- Перевірка: введення `&lt;script&gt;alert(1)&lt;/script&gt;` у поле коментаря або ім'я користувача тепер відображається як текст без виконання JS. Файли для перевірки: [`0.5.0/app.js`](0.5.0/app.js), [`0.5.0/dist/app.js`](0.5.0/dist/app.js)

3) Сценарій C — IDOR (Insecure Direct Object Reference)
- Де відтворюється: Операції над ресурсом `software` (отримання, оновлення, видалення) — ендпойнти: GET /software/:id, PUT /software/:id, DELETE /software/:id
  Файли: backend/src/services/software.service.ts (логіка доступу), backend/src/routes/software.routes.ts, backend/src/middleware/auth.middleware.ts
- Було: без простого механізму поточного користувача у демо-середовищі важко було відтворити IDOR; стандартна авторизація вимагала повноцінного Bearer-токена або guest-контексту.
- Відтворення: запит `GET /software/:id` з `X-Demo-UserId: <otherUserId>` на запис, що належить `ownerId`, має відобразити проблему, якщо доступ не контролюється.
- Виправлення: мідлвеєр `auth.middleware.ts` доповнено підтримкою заголовка `X-Demo-UserId`, який задає поточного користувача для демо/локального тестування. Логіка `ensureSoftwareAccess` у `software.service.ts` перевіряє, що користувач або має роль `admin`, або є власником (`user.id === item.ownerId`).
- Перевірка: власник може отримати `GET /software/:id` з `X-Demo-UserId: <ownerId>` (200), а інший користувач отримує `403 FORBIDDEN`. Запит без `Authorization` або `X-Demo-UserId` повертає `401 UNAUTHORIZED`. Файли для перевірки: [backend/src/middleware/auth.middleware.ts](backend/src/middleware/auth.middleware.ts), [backend/src/services/software.service.ts](backend/src/services/software.service.ts)

4) Сценарій D — Security Misconfiguration / мінімальний hardening
- Де відтворюється: серверний bootstrap і обробка помилок.
  Файли: `0.5.0/backend/src/index.ts`, `0.5.0/backend/src/middleware/error-handler.middleware.ts`.
- Було: за замовчуванням можливо повертати деталі помилок або не мати достатньо безпечних заголовків.
- Відтворення: запит до неіснуючого маршруту або внутрішня помилка повертає стандартний JSON з уніфікованим кодом, але без захисних заголовків.
- Виправлення: додано заголовки безпеки `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy: same-origin` у `index.ts`; обробник помилок у `error-handler.middleware.ts` повертає коректний статус та повідомлення без стек-трейсу.
- Перевірка: `GET /health` і будь-який некоректний запит повертають відповідь із безпечними заголовками. У разі помилки сервер більше не повертає внутрішні стек-трейси в клієнтський JSON.

Додаткові зауваження та ризики
- `searchUnsafe` залишено цілком навмисно як демонстрація "до" для лабораторної роботи — у звіті/демо треба показати "до" та "після" (пояснення + запити).

Файли, змінені у репозиторії (основні)
- backend/src/db.ts — додано параметризовані методи (`getWithParams`, `allWithParams`, `execWithParams`, `runWithParams`)
- backend/src/repositories/software.repository.ts — перехід на параметризовані запити (search/getById/add/update/delete)
- backend/src/repositories/categories.repository.ts — перехід на параметризовані запити
- backend/src/migrations/runMigrations.ts — перехід на параметризовані запити
- backend/src/middleware/auth.middleware.ts — додана підтримка `X-Demo-UserId` для демонстраційної аутентифікації

Інструкція як перевірити локально (швидко)
1) Встановити залежності у папці `0.5.0/backend` (якщо потрібно):

```bash
cd 0.5.0/backend
npm install
npm run build  # якщо потрібно
npm start
```

2) Приклад запитів для перевірки:
- Демонстрація SQLi (до/після):
  - Вразливий запит (демонстрація):
    `GET /software/search-unsafe?q=test' OR '1'='1`
  - Безпечний запит (після):
    `GET /software/search?q=normal`  (параметризація запобігає ін'єкціям)
- IDOR перевірка:
  - Отримати ресурс як власник: `GET /software/<id>` з заголовком `X-Demo-UserId: <ownerId>` → 200
  - Отримати ресурс як інший користувач: `GET /software/<id>` з заголовком `X-Demo-UserId: <otherId>` → 403

