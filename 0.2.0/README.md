# Лабораторна робота №2. Бекенд без БД

## Запуск проєкту
1. Для запуску вперше:
   `npm install`
2. Запустіть сервер у режимі розробки:
   `npm run dev`

Сервер запуститься за адресою: http://localhost:3000

## Swagger / OpenAPI

- Документація Swagger UI доступна за адресою: http://localhost:3000/api-docs
- OpenAPI JSON можна отримати за адресою: http://localhost:3000/api-docs/swagger.json

## Тести

- Запуск unit-тестів: `npm test`

## Реалізовані сутності
1. Software — основна доменна сутність.
   - Підтримує додаткові REST-можливості: фільтрацію (`?license=Free`) та пагінацію (`?page=1&pageSize=2`).
2. Users — друга обов'язкова сутність.

## Приклади запитів

### 1. Сутність Software
**Отримати весь список:**
curl -i http://localhost:3000/api/software

**Створити нове програмне забезпечення:**
curl -i -X POST http://localhost:3000/api/software -H "Content-Type: application/json" -d "{\"name\":\"Visual Studio Code\",\"version\":\"1.86\",\"license\":\"Free\",\"seats\":15,\"comment\":\"Редактор коду\"}"

**Перевірка валідації (Помилка 400 Bad Request):**
curl -i -X POST http://localhost:3000/api/software -H "Content-Type: application/json" -d "{\"name\":\"\",\"version\":\"\",\"license\":\"Free\",\"seats\":0,\"comment\":\"Помилка\"}"

### 2. Сутність Users
**Створити нового користувача:**
curl -i -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d "{\"name\":\"Ivan\",\"email\":\"ivan@example.com\",\"role\":\"admin\"}"

**Отримати список користувачів:**
curl -i http://localhost:3000/api/users