import { softwareRepository } from '../repositories/software.repository';
import { CreateSoftwareDto, UpdateSoftwareDto, Software } from '../../../shared/dtos';
import { ApiError } from '../middleware/error-handler.middleware';

type DemoUser = { id: string; role: 'admin' | 'user' | 'guest' } | undefined;

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

    getById: async (id: string, user?: DemoUser): Promise<Software> => {
        const item = await softwareRepository.getById(id);
        ensureSoftwareAccess(item, user, id);
        return item as Software;
    },

    getSummary: async () => {
        return softwareRepository.getSummary();
    },

    searchUnsafe: async (q: string) => {
        return softwareRepository.searchUnsafe(q);
    },

    search: async (q: string) => {
        return softwareRepository.search(q);
    },

    create: async (dto: CreateSoftwareDto, user?: DemoUser): Promise<Software> => {
        if (!user || user.role === 'guest') {
            throw new ApiError(401, 'UNAUTHORIZED', 'Для створення запису необхідно увійти');
        }

        validateSoftwareDto(dto, false);
        const payload = { ...dto, ownerId: user.id } as CreateSoftwareDto;
        return softwareRepository.add(payload);
    },

    update: async (id: string, dto: UpdateSoftwareDto, user?: DemoUser): Promise<Software> => {
        const existing = await softwareRepository.getById(id);
        ensureSoftwareAccess(existing, user, id);

        validateSoftwareDto(dto, true);
        const updatedItem = await softwareRepository.update(id, { ...existing, ...dto });
        if (!updatedItem) {
            throw new ApiError(500, "INTERNAL_ERROR", "Не вдалося оновити запис");
        }
        return updatedItem;
    },

    delete: async (id: string, user?: DemoUser): Promise<void> => {
        const existing = await softwareRepository.getById(id);
        ensureSoftwareAccess(existing, user, id);

        const isDeleted = await softwareRepository.delete(id);
        if (!isDeleted) {
            throw new ApiError(404, "NOT_FOUND", `ПЗ з id ${id} не знайдено для видалення`);
        }
    }
};

function ensureSoftwareAccess(item: Software | undefined, user: DemoUser | undefined, id: string) {
    if (!item) {
        throw new ApiError(404, 'NOT_FOUND', `ПЗ з id ${id} не знайдено`);
    }

    if (!user) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Необхідно надати контекст користувача');
    }

    if (user.role !== 'admin' && user.id !== item.ownerId) {
        throw new ApiError(403, 'FORBIDDEN', `Доступ до ПЗ з id ${id} заборонено`);
    }
}

// Перевірка DTO перед збереженням у базу
function validateSoftwareDto(dto: CreateSoftwareDto | UpdateSoftwareDto, partial: boolean) {
    const errors: any[] = [];

    if (!partial || dto.name !== undefined) {
        if (!dto.name || dto.name.trim() === "") {
            errors.push({ field: "name", message: "Введіть назву ПЗ" });
        } else if (dto.name.length > 100) {
            errors.push({ field: "name", message: "Назва не має перевищувати 100 символів" });
        }
    }

    if (!partial || dto.version !== undefined) {
        if (!dto.version || dto.version.trim() === "") {
            errors.push({ field: "version", message: "Введіть версію" });
        } else if (dto.version.length > 50) {
            errors.push({ field: "version", message: "Версія не має перевищувати 50 символів" });
        }
    }

    if (!partial || dto.license !== undefined) {
        if (!dto.license || dto.license.trim() === "") {
            errors.push({ field: "license", message: "Оберіть тип ліцензії" });
        }
    }

    if (!partial || dto.seats !== undefined) {
        if (typeof dto.seats !== 'number' || !Number.isInteger(dto.seats) || dto.seats < 1 || dto.seats > 1000) {
            errors.push({ field: "seats", message: "Кількість місць повинна бути цілим числом від 1 до 1000" });
        }
    }

    if (dto.comment !== undefined && dto.comment !== null && dto.comment.length > 300) {
        errors.push({ field: "comment", message: "Коментар не може перевищувати 300 символів" });
    }

    if (errors.length > 0) {
        throw new ApiError(400, "VALIDATION_ERROR", "Некоректні дані запиту", errors);
    }
}