// DTO для категорій
export interface CreateCategoryDto {
    name: string;
    platform?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface Category extends CreateCategoryDto {
    id: string;
}
