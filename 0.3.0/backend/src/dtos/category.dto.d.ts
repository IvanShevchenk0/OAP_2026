export interface CreateCategoryDto {
    name: string;
}
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
}
export interface Category extends CreateCategoryDto {
    id: string;
}
//# sourceMappingURL=category.dto.d.ts.map