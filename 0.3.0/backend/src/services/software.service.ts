import { softwareRepository } from '../repositories/software.repository';
import { categoriesRepository } from '../repositories/categories.repository';
import { usersRepository } from '../repositories/users.repository';
import { CreateSoftwareDto, UpdateSoftwareDto, Software } from '../dtos/software.dto';
import { ApiError } from '../middleware/error-handler.middleware';

export const softwareService = {
    // Логіка бізнес-рівня для роботи з ПЗ.
    // Отримати список з параметрами фільтрації, сортування та пагінації.
    getAll: async (query?: { 
        license?: string; 
        page?: number; 
        pageSize?: number;
        sortBy?: string;
        sortOrder?: string;
    }) => {
        const options: any = {};
        if (query?.license) options.license = query.license;
        if (query?.sortBy) options.sortBy = query.sortBy;
        if (query?.sortOrder) options.sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
        if (query?.page && query?.pageSize) {
            options.limit = query.pageSize;
            options.offset = (query.page - 1) * query.pageSize;
        }

        return softwareRepository.getAll(options);
    },

    getById: async (id: string): Promise<Software> => {
        const item = await softwareRepository.getById(id);
        if (!item) {
            throw new ApiError(404, "NOT_FOUND", `ПЗ з id ${id} не знайдено`);
        }
        return item;
    },

    getSummary: async () => {
        return softwareRepository.getSummary();
    },

    exportData: async (query?: { license?: string | undefined }) => {
        return softwareRepository.getExportData({ license: query?.license });
    },

    importItems: async (items: unknown): Promise<Software[]> => {
        if (!Array.isArray(items)) {
            throw new ApiError(400, 'VALIDATION_ERROR', 'Очікується масив items для імпорту');
        }

        if (items.length > 10) {
            throw new ApiError(400, 'VALIDATION_ERROR', 'Максимум 10 елементів можна імпортувати за раз');
        }

        const seen = new Set<string>();
        const created: Software[] = [];

        for (const [index, rawItem] of items.entries()) {
            if (typeof rawItem !== 'object' || rawItem === null) {
                throw new ApiError(400, 'VALIDATION_ERROR', `Елемент ${index} повинен бути об'єктом`);
            }

            const dto: CreateSoftwareDto = {
                name: (rawItem as any).name as string,
                version: (rawItem as any).version as string,
                license: (rawItem as any).license as string,
                seats: Number((rawItem as any).seats),
                comment: typeof (rawItem as any).comment === 'string' ? (rawItem as any).comment : '',
                ownerId: typeof (rawItem as any).ownerId === 'string' ? (rawItem as any).ownerId : null,
                categoryId: typeof (rawItem as any).categoryId === 'string' ? (rawItem as any).categoryId : null,
            };

            validateSoftwareDto(dto);

            const uniqueKey = `${dto.name.trim().toLowerCase()}|${dto.version.trim().toLowerCase()}`;
            if (seen.has(uniqueKey)) {
                throw new ApiError(400, 'VALIDATION_ERROR', `Дубликат у запиті імпорту: '${dto.name}' версія '${dto.version}'`);
            }
            seen.add(uniqueKey);

            if (await softwareRepository.existsByNameAndVersion(dto.name, dto.version)) {
                throw new ApiError(409, 'CONFLICT', `ПЗ з назвою '${dto.name}' та версією '${dto.version}' вже існує`);
            }

            if (dto.ownerId) {
                const owner = await usersRepository.getById(dto.ownerId);
                if (!owner) {
                    throw new ApiError(400, 'VALIDATION_ERROR', `Власник з id ${dto.ownerId} не знайдено`);
                }
            }

            if (dto.categoryId) {
                const category = await categoriesRepository.getById(dto.categoryId);
                if (!category) {
                    throw new ApiError(400, 'VALIDATION_ERROR', `Категорію з id ${dto.categoryId} не знайдено`);
                }
            }

            const createdItem = await softwareRepository.add(dto);
            created.push(createdItem);
        }

        return created;
    },

    // Unsafe search delegated to repository (demonstration only)
    searchUnsafe: async (q: string) => {
        return softwareRepository.searchUnsafe(q);
    },

    create: async (dto: CreateSoftwareDto): Promise<Software> => {
        validateSoftwareDto(dto);
        return softwareRepository.add(dto);
    },

    update: async (id: string, dto: UpdateSoftwareDto): Promise<Software> => {
        await softwareService.getById(id); // Перевірка чи існує
        const updatedItem = await softwareRepository.update(id, dto);
        if (!updatedItem) {
            throw new ApiError(500, "INTERNAL_ERROR", "Не вдалося оновити запис");
        }
        return updatedItem;
    },

    delete: async (id: string): Promise<void> => {
        const isDeleted = await softwareRepository.delete(id);
        if (!isDeleted) {
            throw new ApiError(404, "NOT_FOUND", `ПЗ з id ${id} не знайдено для видалення`);
        }
    }
};

// Перевірка DTO перед збереженням у базу
function validateSoftwareDto(dto: CreateSoftwareDto) {
    const errors: any[] = [];

    if (!dto.name || dto.name.trim() === "") {
        errors.push({ field: "name", message: "Введіть назву ПЗ" });
    }
    if (!dto.version || dto.version.trim() === "") {
        errors.push({ field: "version", message: "Введіть версію" });
    }
    if (!dto.license) {
        errors.push({ field: "license", message: "Оберіть тип ліцензії" });
    }
    if (typeof dto.seats !== 'number' || dto.seats < 1) {
        errors.push({ field: "seats", message: "Введіть число від 1" });
    }

    if (errors.length > 0) {
        throw new ApiError(400, "VALIDATION_ERROR", "Некоректні дані запиту", errors);
    }
}