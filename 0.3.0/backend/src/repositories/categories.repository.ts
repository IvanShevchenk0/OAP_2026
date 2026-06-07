// Репозиторій `categories` (на SQLite)
import { v4 as uuidv4 } from 'uuid';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';
import db from '../db';

export const categoriesRepository = {
    getAll: async (): Promise<Category[]> => {
        return db.all('SELECT id, name, platform FROM categories');
    },

    getById: async (id: string): Promise<Category | undefined> => {
        return await db.get(`SELECT id, name, platform FROM categories WHERE id = ${db.escape(id)}`) as Category | undefined;
    },

    add: async (dto: CreateCategoryDto): Promise<Category> => {
        const id = uuidv4();
        await db.run(`INSERT INTO categories (id, name, platform) VALUES (${db.escape(id)}, ${db.escape(dto.name)}, ${db.escape(dto.platform || null)})`);
        return { id, ...dto } as Category;
    },

    update: async (id: string, dto: UpdateCategoryDto): Promise<Category | null> => {
        const existing = await categoriesRepository.getById(id);
        if (!existing) return null;
        const updated = { ...existing, ...dto, id } as Category;
        await db.run(`UPDATE categories SET name = ${db.escape(updated.name)}, platform = ${db.escape(updated.platform || null)} WHERE id = ${db.escape(id)}`);
        return updated;
    },

    delete: async (id: string): Promise<boolean> => {
        const info = await db.run(`DELETE FROM categories WHERE id = ${db.escape(id)}`);
        return info.changes > 0;
    }
};
