// Те, що клієнт надсилає при створенні нового ПЗ
export interface CreateSoftwareDto {
    name: string;
    version: string;
    license: string;
    seats: number;
    comment: string;
    // Optional owner (user id). Підтримує зв'язок `software.owner_id -> users.id`.
    // Запис може мати null, якщо власник не вказаний.
    ownerId?: string | null;
    // Optional category (category id). Підтримує зв'язок `software.category_id -> categories.id`.
    // Запис може мати null, якщо категорія не вказана.
    categoryId?: string | null;
}

// Те, що клієнт надсилає при оновленні
export interface UpdateSoftwareDto extends Partial<CreateSoftwareDto> {}

// Повна модель, яка зберігається на сервері і повертається клієнту
export interface Software extends CreateSoftwareDto {
    id: string;
}