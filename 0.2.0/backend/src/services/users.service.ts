import { usersRepository } from '../repositories/users.repository';
import { CreateUserDto, UpdateUserDto, User } from '../dtos/users.dto';
import { ApiError } from '../middleware/error-handler.middleware';

export const usersService = {
    getAll: (): User[] => {
        return usersRepository.getAll();
    },

    getById: (id: string): User => {
        const user = usersRepository.getById(id);
        if (!user) {
            throw new ApiError(404, "NOT_FOUND", `Користувача з id ${id} не знайдено`);
        }
        return user;
    },

    create: (dto: CreateUserDto): User => {
        validateUserDto(dto); // Валідація перед збереженням
        return usersRepository.add(dto);
    },

    update: (id: string, dto: UpdateUserDto): User => {
        usersService.getById(id); // Перевірка, чи існує користувач перед оновленням
        
        const updatedUser = usersRepository.update(id, dto);
        if (!updatedUser) {
            throw new ApiError(500, "INTERNAL_ERROR", "Не вдалося оновити користувача");
        }
        return updatedUser;
    },

    delete: (id: string): void => {
        const isDeleted = usersRepository.delete(id);
        if (!isDeleted) {
            throw new ApiError(404, "NOT_FOUND", `Користувача з id ${id} не знайдено для видалення`);
        }
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