export interface CreateUserDto {
    name: string;
    email: string;
    role: string;
}
export interface UpdateUserDto extends Partial<CreateUserDto> {
}
export interface User extends CreateUserDto {
    id: string;
}
//# sourceMappingURL=users.dto.d.ts.map