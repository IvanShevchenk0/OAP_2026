import { beforeEach, describe, expect, it } from 'vitest';
import { softwareService } from '../../src/services/software.service';
import { softwareRepository } from '../../src/repositories/software.repository';
import { ApiError } from '../../src/middleware/error-handler.middleware';
import type { CreateSoftwareDto, UpdateSoftwareDto } from '../../src/dtos/software.dto';

describe('softwareService', () => {
    beforeEach(() => {
        softwareRepository.reset();
    });

    it('should create new software item', () => {
        const dto: CreateSoftwareDto = {
            name: 'Test App',
            version: '1.0.0',
            license: 'Free',
            seats: 5,
            comment: 'Тестове ПЗ'
        };

        const item = softwareService.create(dto);

        expect(item.id).toBeDefined();
        expect(item.name).toBe(dto.name);
        expect(item.version).toBe(dto.version);
        expect(item.license).toBe(dto.license);
        expect(item.seats).toBe(dto.seats);
    });

    it('should get item by id after creation', () => {
        const dto: CreateSoftwareDto = {
            name: 'Another App',
            version: '2.0.1',
            license: 'Commercial',
            seats: 10,
            comment: 'Комерційне ПЗ'
        };

        const created = softwareService.create(dto);
        const found = softwareService.getById(created.id);

        expect(found).toEqual(created);
    });

    it('should throw ApiError 404 when item is not found', () => {
        expect(() => softwareService.getById('missing-id')).toThrow(ApiError);
    });

    it('should update existing item', () => {
        const dto: CreateSoftwareDto = {
            name: 'UpdateApp',
            version: '1.0.0',
            license: 'Free',
            seats: 3,
            comment: 'ПЗ для оновлення'
        };

        const created = softwareService.create(dto);
        const updateDto: UpdateSoftwareDto = { version: '1.1.0', seats: 4 };

        const updated = softwareService.update(created.id, updateDto);

        expect(updated.version).toBe('1.1.0');
        expect(updated.seats).toBe(4);
        expect(updated.name).toBe(dto.name);
    });

    it('should delete existing item', () => {
        const dto: CreateSoftwareDto = {
            name: 'DeleteApp',
            version: '0.9.0',
            license: 'Commercial',
            seats: 2,
            comment: 'ПЗ для видалення'
        };

        const created = softwareService.create(dto);
        softwareService.delete(created.id);

        expect(() => softwareService.getById(created.id)).toThrow(ApiError);
    });

    it('should validate create dto and throw validation error for invalid data', () => {
        const invalidDto = {
            name: '',
            version: '',
            license: '',
            seats: 0,
            comment: ''
        } as unknown as CreateSoftwareDto;

        expect(() => softwareService.create(invalidDto)).toThrow(ApiError);
    });

    it('should filter and paginate software list', () => {
        const first: CreateSoftwareDto = {
            name: 'A',
            version: '1.0',
            license: 'Free',
            seats: 1,
            comment: 'A'
        };
        const second: CreateSoftwareDto = {
            name: 'B',
            version: '1.1',
            license: 'Free',
            seats: 2,
            comment: 'B'
        };
        const third: CreateSoftwareDto = {
            name: 'C',
            version: '1.2',
            license: 'Commercial',
            seats: 3,
            comment: 'C'
        };

        softwareService.create(first);
        softwareService.create(second);
        softwareService.create(third);

        const result = softwareService.getAll({ license: 'Free', page: 1, pageSize: 1 });

        expect(result.total).toBe(2);
        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toBeDefined();
        const firstItem = result.items[0]!;
        expect(firstItem.license).toBe('Free');
    });
});
