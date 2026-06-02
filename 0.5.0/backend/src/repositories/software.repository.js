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
        const params = [];
        if (options?.license) {
            where.push('license = ?');
            params.push(options.license);
        }
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        let orderSql = '';
        if (options?.sortBy && ALLOWED_SORT_COLUMNS.has(options.sortBy)) {
            orderSql = `ORDER BY ${options.sortBy} ${options.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
        }
        const limitSql = (typeof options?.limit === 'number') ? `LIMIT ${options.limit}` : '';
        const offsetSql = (typeof options?.offset === 'number') ? `OFFSET ${options.offset}` : '';
        const totalStmt = await db_1.default.prepare(`SELECT COUNT(*) as cnt FROM software ${whereSql}`);
        const totalRow = totalStmt.get(...params);
        const total = totalRow ? totalRow.cnt : 0;
        const sql = `SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software ${whereSql} ${orderSql} ${limitSql} ${offsetSql}`;
        const stmt = await db_1.default.prepare(sql);
        const items = stmt.all(...params);
        return { items, total };
    },
    getSummary: async () => {
        const stmt = await db_1.default.prepare('SELECT COUNT(*) as total, SUM(seats) as sumSeats, AVG(seats) as avgSeats FROM software');
        const row = stmt.get();
        return { total: row?.total || 0, sumSeats: row?.sumSeats || 0, avgSeats: row?.avgSeats || 0 };
    },
    // Небезпечний пошук: демонстрація SQL-ін'єкцій через конкатенацію рядків.
    searchUnsafe: async (q) => {
        const sql = `SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software WHERE name LIKE '%${q}%' OR comment LIKE '%${q}%'`;
        const stmt = await db_1.default.prepare(sql);
        return stmt.all();
    },
    // Безпечний пошук із параметризованими значеннями для захисту від SQL-ін'єкцій.
    search: async (q) => {
        const value = `%${q}%`;
        const stmt = await db_1.default.prepare('SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software WHERE name LIKE ? OR comment LIKE ?');
        return stmt.all(value, value);
    },
    getById: async (id) => {
        const stmt = await db_1.default.prepare('SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software WHERE id = ?');
        return stmt.get(id);
    },
    add: async (dto) => {
        const id = (0, uuid_1.v4)();
        const stmt = await db_1.default.prepare('INSERT INTO software (id, name, version, license, seats, comment, owner_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        stmt.run(id, dto.name, dto.version, dto.license, dto.seats, dto.comment || null, dto.ownerId || null, dto.categoryId || null);
        return { id, ...dto };
    },
    update: async (id, dto) => {
        const existing = await exports.softwareRepository.getById(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...dto, id };
        const stmt = await db_1.default.prepare('UPDATE software SET name = ?, version = ?, license = ?, seats = ?, comment = ?, owner_id = ?, category_id = ? WHERE id = ?');
        stmt.run(updated.name, updated.version, updated.license, updated.seats, updated.comment || null, updated.ownerId || null, updated.categoryId || null, id);
        return updated;
    },
    delete: async (id) => {
        const stmt = await db_1.default.prepare('DELETE FROM software WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }
};
//# sourceMappingURL=software.repository.js.map