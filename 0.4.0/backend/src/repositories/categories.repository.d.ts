import { Category, CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';
export declare const categoriesRepository: {
    getAll: () => Promise<Category[]>;
    getById: (id: string) => Promise<Category | undefined>;
    add: (dto: CreateCategoryDto) => Promise<Category>;
    update: (id: string, dto: UpdateCategoryDto) => Promise<Category | null>;
    delete: (id: string) => Promise<boolean>;
};
//# sourceMappingURL=categories.repository.d.ts.map