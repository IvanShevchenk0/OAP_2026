import { softwareRepository } from '../repositories/software.repository';
import { CreateSoftwareDto, UpdateSoftwareDto, Software } from '../shared/dtos';
import { ApiError } from '../middleware/error-handler.middleware';

// Перевірка доступу: користувач може читати/змінювати ресурс, тільки якщо він адмін або власник
export async function ensureSoftwareAccess(itemId: string, user: any): Promise<Software> {
    const item = await softwareRepository.getById(itemId);
    if (!item) {
        throw new ApiError(404, "NOT_FOUND", `ПЗ з id ${itemId} не знайдено`);
    }

    // Дозволяємо адміністратору та власнику
    if (user.role === 'admin' || (user.id === item.ownerId)) {
        return item;
    }

    // Всім іншим - 403 FORBIDDEN
    throw new ApiError(403, "FORBIDDEN", "Вам не дозволено редагувати цей ресурс");
}

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

    // Безпечний пошук через параметризований запит
    search: async (q: string) => {
        return softwareRepository.search(q);
    },

    // Небезпечний пошук через репозиторій (демонстрація SQL-ін'єкцій)
    searchUnsafe: async (q: string) => {
        return softwareRepository.searchUnsafe(q);
    },

    create: async (dto: CreateSoftwareDto): Promise<Software> => {
        validateSoftwareDto(dto, false);
        return softwareRepository.add(dto);
    },

    update: async (id: string, dto: UpdateSoftwareDto): Promise<Software> => {
        await softwareService.getById(id); // Перевірка чи існує
        validateSoftwareDto(dto, true);
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