import { CreateCategoryDto, UpdateCategoryDto, Category } from '../dtos/category.dto';
export declare const categoriesService: {
    getAll: () => Promise<Category[]>;
    getById: (id: string) => Promise<Category>;
    create: (dto: CreateCategoryDto) => Promise<Category>;
    update: (id: string, dto: UpdateCategoryDto) => Promise<Category>;
    delete: (id: string) => Promise<void>;
};
//# sourceMappingURL=categories.service.d.ts.map