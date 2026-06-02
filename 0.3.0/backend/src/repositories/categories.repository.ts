// Репозиторій `categories` (на SQLite)
import { v4 as uuidv4 } from 'uuid';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';
import db from '../db';

export const categoriesRepository = {
    getAll: async (): Promise<Category[]> => {
        const stmt = await db.prepare('SELECT id, name, platform FROM categories');
        return stmt.all();
    },

    getById: async (id: string): Promise<Category | undefined> => {
        const stmt = await db.prepare('SELECT id, name, platform FROM categories WHERE id = ?');
        return stmt.get(id) as Category | undefined;
    },

    add: async (dto: CreateCategoryDto): Promise<Category> => {
        const id = uuidv4();
        const stmt = await db.prepare('INSERT INTO categories (id, name, platform) VALUES (?, ?, ?)');
        stmt.run(id, dto.name, dto.platform || null);
        return { id, ...dto } as Category;
    },

    update: async (id: string, dto: UpdateCategoryDto): Promise<Category | null> => {
        const existing = await categoriesRepository.getById(id);
        if (!existing) return null;
        const updated = { ...existing, ...dto, id } as Category;
        const stmt = await db.prepare('UPDATE categories SET name = ?, platform = ? WHERE id = ?');
        stmt.run(updated.name, updated.platform || null, id);
        return updated;
    },

    delete: async (id: string): Promise<boolean> => {
        const stmt = await db.prepare('DELETE FROM categories WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }
};
