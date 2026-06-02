// Те, що клієнт надсилає при створенні нового користувача
export interface CreateUserDto {
    name: string;
    email: string;
    role: string;
}

// Те, що клієнт надсилає при оновленні
export interface UpdateUserDto extends Partial<CreateUserDto> {}

// Повна модель користувача, яка зберігається на сервері
export interface User extends CreateUserDto {
    id: string;
}