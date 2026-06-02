import { softwareRepository } from '../repositories/software.repository';
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