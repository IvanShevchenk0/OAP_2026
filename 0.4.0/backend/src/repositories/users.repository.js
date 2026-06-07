"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRepository = void 0;
// Репозиторій `users` (на SQLite)
// Реалізація CRUD для `users` через SQLite.
// Файл БД зберігається в `data/database.db`.
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../db"));
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
exports.usersRepository = {
    getAll: async () => {
        return await db_1.default.all('SELECT id, name, email, role FROM users');
    },
    getById: async (id) => {
        return await db_1.default.get(`SELECT id, name, email, role FROM users WHERE id = ${db_1.default.escape(id)}`);
    },
    add: async (dto) => {
        const id = (0, uuid_1.v4)();
        try {
            await db_1.default.exec(`INSERT INTO users (id, name, email, role) VALUES (${db_1.default.escape(id)}, ${db_1.default.escape(dto.name)}, ${db_1.default.escape(dto.email)}, ${db_1.default.escape(dto.role)})`);
            return { id, ...dto };
        }
        catch (err) {
            if (err && (String(err.message).includes('UNIQUE') || String(err.message).includes('constraint failed'))) {
                throw new error_handler_middleware_1.ApiError(409, 'CONFLICT', `Користувач з email ${dto.email} вже існує`);
            }
            throw err;
        }
    },
    update: async (id, dto) => {
        const existing = await exports.usersRepository.getById(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...dto, id };
        await db_1.default.exec(`UPDATE users SET name = ${db_1.default.escape(updated.name)}, email = ${db_1.default.escape(updated.email)}, role = ${db_1.default.escape(updated.role)} WHERE id = ${db_1.default.escape(id)}`);
        return updated;
    },
    delete: async (id) => {
        const result = await db_1.default.run(`DELETE FROM users WHERE id = ${db_1.default.escape(id)}`);
        return result.changes > 0;
    },
    // JOIN example: отримати користувача та його ПЗ (використовує JOIN)
    getWithSoftware: async (id) => {
        const sql = `SELECT u.id as user_id, u.name as user_name, u.email as user_email, u.role as user_role,
          s.id as software_id, s.name as software_name, s.version as software_version, s.license as software_license,
          s.seats as software_seats, s.comment as software_comment, s.category_id as software_category_id
        FROM users u LEFT JOIN software s ON s.owner_id = u.id WHERE u.id = ${db_1.default.escape(id)}`;
        const rows = await db_1.default.all(sql);
        if (!rows || rows.length === 0)
            return null;
        const first = rows[0];
        const user = { id: first.user_id, name: first.user_name, email: first.user_email, role: first.user_role };
        const software = rows.filter(r => r.software_id).map(r => ({ id: r.software_id, name: r.software_name, version: r.software_version, license: r.software_license, seats: r.software_seats, comment: r.software_comment, ownerId: id, categoryId: r.software_category_id }));
        return { user, software };
    }
};
//# sourceMappingURL=users.repository.js.map