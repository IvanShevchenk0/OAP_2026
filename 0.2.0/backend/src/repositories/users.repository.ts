import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserDto, UpdateUserDto } from '../dtos/users.dto';

// Зберігання в оперативній пам'яті 
let users: User[] = [];

export const usersRepository = {
    // Отримання всіх користувачів
    getAll: (): User[] => {
        return users;
    },

    // Знаходження користувача за ID
    getById: (id: string): User | undefined => {
        return users.find(user => user.id === id);
    },

    // Додавання нового користувача
    add: (dto: CreateUserDto): User => {
        const newUser: User = {
            id: uuidv4(), // Сервер генерує унікальний ID для нового користувача
            ...dto
        };
        users.push(newUser);
        return newUser;
    },

    // Оновлення існуючого користувача
    update: (id: string, dto: UpdateUserDto): User | null => {
        const index = users.findIndex(user => user.id === id);
        if (index === -1) return null;

        const existingUser = users[index];
        if (!existingUser) return null;

        // Оновлення, гарантовано залишаючи старий id
        const updatedUser = { ...existingUser, ...dto, id: existingUser.id };
        users[index] = updatedUser;
        return updatedUser;
    },

    // Видалення користувача
    delete: (id: string): boolean => {
        const index = users.findIndex(user => user.id === id);
        if (index === -1) return false;

        users.splice(index, 1);
        return true;
    }
};