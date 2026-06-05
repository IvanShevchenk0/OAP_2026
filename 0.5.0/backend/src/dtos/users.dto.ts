// Те, що клієнт надсилає при створенні нового користувача
export interface CreateUserDto {
    name: string;
    email: string;
    role: string;
    password?: string;
    passwordHash?: string;
}

// Те, що клієнт надсилає при оновленні
export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
    password?: string;
    passwordHash?: string;
}

// Повна модель користувача, яка зберігається на сервері
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}