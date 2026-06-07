"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.softwareRepository = void 0;
// Репозиторій `software` (на SQLite)
// Підтримка фільтрації/сортування/пагінації на рівні SQL.
// Повертається { items, total } — total рахується окремим запитом.
// Зв'язок з users реалізовано через owner_id (foreign key).
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../db"));
const ALLOWED_SORT_COLUMNS = new Set(['name', 'version', 'license', 'seats']);
exports.softwareRepository = {
    // Репозиторій для CRUD-операцій над таблицею software
    getAll: async (options) => {
        const where = [];
        if (options?.license) {
            where.push(`license = ${db_1.default.escape(options.license)}`);
        }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        let orderSql = '';
        if (options?.sortBy && ALLOWED_SORT_COLUMNS.has(options.sortBy)) {
            orderSql = `ORDER BY ${options.sortBy} ${options.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
        }
        const limitSql = (typeof options?.limit === 'number') ? `LIMIT ${options.limit}` : '';
        const offsetSql = (typeof options?.offset === 'number') ? `OFFSET ${options.offset}` : '';
        const totalSql = `SELECT COUNT(*) as cnt FROM software ${whereSql}`;
        const totalRow = await db_1.default.get(totalSql);
        const total = totalRow ? totalRow.cnt : 0;
        const sql = `SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software ${whereSql} ${orderSql} ${limitSql} ${offsetSql}`;
        const items = await db_1.default.all(sql);
        return { items, total };
    },
    getSummary: async () => {
        const row = await db_1.default.get('SELECT COUNT(*) as total, SUM(seats) as sumSeats, AVG(seats) as avgSeats FROM software');
        return { total: row?.total || 0, sumSeats: row?.sumSeats || 0, avgSeats: row?.avgSeats || 0 };
    },
    // Уразливий приклад пошуку, який показує ризик SQL ін'єкцій.
    searchUnsafe: async (q) => {
        const sql = `SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software WHERE name LIKE '%${q}%' OR comment LIKE '%${q}%'`;
        return await db_1.default.all(sql);
    },
    getById: async (id) => {
        return await db_1.default.get(`SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software WHERE id = ${db_1.default.escape(id)}`);
    },
    add: async (dto) => {
        const id = (0, uuid_1.v4)();
        await db_1.default.exec(`INSERT INTO software (id, name, version, license, seats, comment, owner_id, category_id) VALUES (${db_1.default.escape(id)}, ${db_1.default.escape(dto.name)}, ${db_1.default.escape(dto.version)}, ${db_1.default.escape(dto.license)}, ${db_1.default.escape(dto.seats)}, ${db_1.default.escape(dto.comment || null)}, ${db_1.default.escape(dto.ownerId || null)}, ${db_1.default.escape(dto.categoryId || null)})`);
        return { id, ...dto };
    },
    update: async (id, dto) => {
        const existing = await exports.softwareRepository.getById(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...dto, id };
        await db_1.default.exec(`UPDATE software SET name = ${db_1.default.escape(updated.name)}, version = ${db_1.default.escape(updated.version)}, license = ${db_1.default.escape(updated.license)}, seats = ${db_1.default.escape(updated.seats)}, comment = ${db_1.default.escape(updated.comment || null)}, owner_id = ${db_1.default.escape(updated.ownerId || null)}, category_id = ${db_1.default.escape(updated.categoryId || null)} WHERE id = ${db_1.default.escape(id)}`);
        return updated;
    },
    delete: async (id) => {
        const result = await db_1.default.run(`DELETE FROM software WHERE id = ${db_1.default.escape(id)}`);
        return result.changes > 0;
    }
};
//# sourceMappingURL=software.repository.js.map