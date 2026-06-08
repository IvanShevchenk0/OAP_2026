// Те, що клієнт надсилає при створенні нового користувача
export interface CreateUserDto {
    name: string;
    email: string;
    role: 'admin' | 'user';
    passwordHash?: string;
}

// Те, що клієнт надсилає при оновленні
export interface UpdateUserDto extends Partial<CreateUserDto> {}

// Повна модель користувача, яка відправляється клієнту
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

// Внутрішнє представлення користувача у базі даних
export interface StoredUser extends User {
    password_hash: string;
}
