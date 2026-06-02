import { categoriesRepository } from '../repositories/categories.repository';
import { CreateCategoryDto, UpdateCategoryDto, Category } from '../dtos/category.dto';
import { ApiError } from '../middleware/error-handler.middleware';

export const categoriesService = {
    getAll: async (): Promise<Category[]> => {
        return categoriesRepository.getAll();
    },

    getById: async (id: string): Promise<Category> => {
        const cat = await categoriesRepository.getById(id);
        if (!cat) throw new ApiError(404, 'NOT_FOUND', `Категорію з id ${id} не знайдено`);
        return cat;
    },

    create: async (dto: CreateCategoryDto): Promise<Category> => {
        if (!dto.name || dto.name.trim() === '') {
            throw new ApiError(400, 'VALIDATION_ERROR', 'Назва категорії обов\'язкова');
        }
        return categoriesRepository.add(dto);
    },

    update: async (id: string, dto: UpdateCategoryDto): Promise<Category> => {
        await categoriesService.getById(id);
        const updated = await categoriesRepository.update(id, dto);
        if (!updated) throw new ApiError(500, 'INTERNAL_ERROR', 'Не вдалося оновити категорію');
        return updated;
    },

    delete: async (id: string): Promise<void> => {
        const ok = await categoriesRepository.delete(id);
        if (!ok) throw new ApiError(404, 'NOT_FOUND', `Категорію з id ${id} не знайдено для видалення`);
    }
};
