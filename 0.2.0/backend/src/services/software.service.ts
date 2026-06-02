import { softwareRepository } from '../repositories/software.repository';
import { CreateSoftwareDto, UpdateSoftwareDto, Software } from '../dtos/software.dto';
import { ApiError } from '../middleware/error-handler.middleware';

export const softwareService = {
    // Фільтрація, сортування та пагінація
    getAll: (query?: { 
        license?: string; 
        page?: number; 
        pageSize?: number;
        sortBy?: string;
        sortOrder?: string;
    }) => {
        let items = softwareRepository.getAll();

        // Фільтрація
        if (query?.license) {
            items = items.filter(item => item.license === query.license);
        }

        // Сортування
        if (query?.sortBy) {
            const sortBy = query.sortBy as keyof Software;
            const direction = query.sortOrder === 'desc' ? -1 : 1;

            items.sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return -1 * direction;
                if (a[sortBy] > b[sortBy]) return 1 * direction;
                return 0;
            });
        }

        const total = items.length;

        // Пагінація
        if (query?.page && query?.pageSize) {
            const startIndex = (query.page - 1) * query.pageSize;
            items = items.slice(startIndex, startIndex + query.pageSize);
        }

        return { items, total };
    },

    getById: (id: string): Software => {
        const item = softwareRepository.getById(id);
        if (!item) {
            throw new ApiError(404, "NOT_FOUND", `ПЗ з id ${id} не знайдено`);
        }
        return item;
    },

    create: (dto: CreateSoftwareDto): Software => {
        validateSoftwareDto(dto);
        return softwareRepository.add(dto);
    },

    update: (id: string, dto: UpdateSoftwareDto): Software => {
        softwareService.getById(id); // Перевірка чи існує
        
        const updatedItem = softwareRepository.update(id, dto);
        if (!updatedItem) {
            throw new ApiError(500, "INTERNAL_ERROR", "Не вдалося оновити запис");
        }
        return updatedItem;
    },

    delete: (id: string): void => {
        const isDeleted = softwareRepository.delete(id);
        if (!isDeleted) {
            throw new ApiError(404, "NOT_FOUND", `ПЗ з id ${id} не знайдено для видалення`);
        }
    }
};

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