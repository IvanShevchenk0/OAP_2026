// Те, що клієнт надсилає при створенні нового ПЗ
export interface CreateSoftwareDto {
    name: string;
    version: string;
    license: string;
    seats: number;
    comment: string;
}

// Те, що клієнт надсилає при оновленні
export interface UpdateSoftwareDto extends Partial<CreateSoftwareDto> {}

// Повна модель, яка зберігається на сервері і повертається клієнту
export interface Software extends CreateSoftwareDto {
    id: string;
}