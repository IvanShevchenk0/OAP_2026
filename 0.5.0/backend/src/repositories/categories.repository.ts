// Репозиторій `categories` (на SQLite)
import { v4 as uuidv4 } from 'uuid';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';
import db from '../db';
import { ApiError } from '../middleware/error-handler.middleware';

export const categoriesRepository = {
    getAll: async (): Promise<Category[]> => {
        return await db.all('SELECT id, name, platform FROM categories');
    },

    getById: async (id: string): Promise<Category | undefined> => {
        return await db.get(`SELECT id, name, platform FROM categories WHERE id = ${db.escape(id)}`) as Category | undefined;
    },

    add: async (dto: CreateCategoryDto): Promise<Category> => {
        const id = uuidv4();
        try {
            await db.exec(`INSERT INTO categories (id, name, platform) VALUES (${db.escape(id)}, ${db.escape(dto.name)}, ${db.escape(dto.platform || null)})`);
            return { id, ...dto } as Category;
        } catch (err: any) {
            if (err && (String(err.message).includes('UNIQUE') || String(err.message).includes('constraint failed'))) {
                throw new ApiError(409, 'CONFLICT', `Категорія з назвою ${dto.name} вже існує`);
            }
            throw err;
        }
    },

    update: async (id: string, dto: UpdateCategoryDto): Promise<Category | null> => {
        const existing = await categoriesRepository.getById(id);
        if (!existing) return null;
        const updated = { ...existing, ...dto, id } as Category;
        await db.exec(`UPDATE categories SET name = ${db.escape(updated.name)}, platform = ${db.escape(updated.platform || null)} WHERE id = ${db.escape(id)}`);
        return updated;
    },

    delete: async (id: string): Promise<boolean> => {
        const result = await db.run(`DELETE FROM categories WHERE id = ${db.escape(id)}`);
        return result.changes > 0;
    }
};
