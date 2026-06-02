import { usersRepository } from '../repositories/users.repository';
import { CreateUserDto, UpdateUserDto, User } from '../dtos/users.dto';
import { ApiError } from '../middleware/error-handler.middleware';

export const usersService = {
    getAll: async (): Promise<User[]> => {
        return usersRepository.getAll();
    },

    getById: async (id: string): Promise<User> => {
        const user = await usersRepository.getById(id);
        if (!user) {
            throw new ApiError(404, "NOT_FOUND", `Користувача з id ${id} не знайдено`);
        }
        return user;
    },

    create: async (dto: CreateUserDto): Promise<User> => {
        validateUserDto(dto); // Валідація перед збереженням
        return usersRepository.add(dto);
    },

    update: async (id: string, dto: UpdateUserDto): Promise<User> => {
        await usersService.getById(id); // Перевірка, чи існує користувач перед оновленням
        const updatedUser = await usersRepository.update(id, dto);
        if (!updatedUser) {
            throw new ApiError(500, "INTERNAL_ERROR", "Не вдалося оновити користувача");
        }
        return updatedUser;
    },

    delete: async (id: string): Promise<void> => {
        const isDeleted = await usersRepository.delete(id);
        if (!isDeleted) {
            throw new ApiError(404, "NOT_FOUND", `Користувача з id ${id} не знайдено для видалення`);
        }
    },
    // Повертає користувача та його ПЗ (JOIN)
    getWithSoftware: async (id: string) => {
        const res = await usersRepository.getWithSoftware(id);
        if (!res) throw new ApiError(404, 'NOT_FOUND', `Користувача з id ${id} не знайдено`);
        return res;
    }
};

// Перевірка даних користувача
function validateUserDto(dto: CreateUserDto) {
    const errors: any[] = [];

    if (!dto.name || dto.name.trim().length < 2) {
        errors.push({ field: "name", message: "Ім'я обов'язкове і має бути не менше 2 символів" });
    }
    // Перевірка на наявність @ в email
    if (!dto.email || !dto.email.includes('@')) {
        errors.push({ field: "email", message: "Введіть коректний email" });
    }
    // Роль має бути тільки з набору допустимих значень
    if (!dto.role || (dto.role !== 'admin' && dto.role !== 'user')) {
        errors.push({ field: "role", message: "Роль має бути 'admin' або 'user'" });
    }

    if (errors.length > 0) {
        throw new ApiError(400, "VALIDATION_ERROR", "Некоректні дані користувача", errors);
    }
}