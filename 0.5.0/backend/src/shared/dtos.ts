export interface CreateSoftwareDto {
    name: string;
    version: string;
    license: string;
    seats: number;
    comment: string;
    ownerId?: string | null;
    categoryId?: string | null;
}

export interface UpdateSoftwareDto extends Partial<CreateSoftwareDto> {}

export interface Software extends CreateSoftwareDto {
    id: string;
}

export interface ApiListResponse<T> {
    data: T[];
    meta?: { total: number };
}

export interface ApiItemResponse<T> {
    data: T;
}
