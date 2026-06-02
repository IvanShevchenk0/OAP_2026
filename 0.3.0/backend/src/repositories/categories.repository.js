"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRepository = void 0;
// Репозиторій `categories` (на SQLite)
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../db"));
exports.categoriesRepository = {
    getAll: async () => {
        const stmt = await db_1.default.prepare('SELECT id, name FROM categories');
        return stmt.all();
    },
    getById: async (id) => {
        const stmt = await db_1.default.prepare('SELECT id, name FROM categories WHERE id = ?');
        return stmt.get(id);
    },
    add: async (dto) => {
        const id = (0, uuid_1.v4)();
        const stmt = await db_1.default.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
        stmt.run(id, dto.name);
        return { id, ...dto };
    },
    update: async (id, dto) => {
        const existing = await exports.categoriesRepository.getById(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...dto, id };
        const stmt = await db_1.default.prepare('UPDATE categories SET name = ? WHERE id = ?');
        stmt.run(updated.name, id);
        return updated;
    },
    delete: async (id) => {
        const stmt = await db_1.default.prepare('DELETE FROM categories WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }
};
//# sourceMappingURL=categories.repository.js.map