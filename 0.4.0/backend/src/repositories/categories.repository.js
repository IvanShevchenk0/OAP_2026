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
        return await db_1.default.all('SELECT id, name, platform FROM categories');
    },
    getById: async (id) => {
        return await db_1.default.get(`SELECT id, name, platform FROM categories WHERE id = ${db_1.default.escape(id)}`);
    },
    add: async (dto) => {
        const id = (0, uuid_1.v4)();
        await db_1.default.exec(`INSERT INTO categories (id, name, platform) VALUES (${db_1.default.escape(id)}, ${db_1.default.escape(dto.name)}, ${db_1.default.escape(dto.platform || null)})`);
        return { id, ...dto };
    },
    update: async (id, dto) => {
        const existing = await exports.categoriesRepository.getById(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...dto, id };
        await db_1.default.exec(`UPDATE categories SET name = ${db_1.default.escape(updated.name)}, platform = ${db_1.default.escape(updated.platform || null)} WHERE id = ${db_1.default.escape(id)}`);
        return updated;
    },
    delete: async (id) => {
        const result = await db_1.default.run(`DELETE FROM categories WHERE id = ${db_1.default.escape(id)}`);
        return result.changes > 0;
    }
};
//# sourceMappingURL=categories.repository.js.map