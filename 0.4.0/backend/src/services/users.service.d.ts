import { CreateUserDto, UpdateUserDto, User } from '../dtos/users.dto';
export declare const usersService: {
    getAll: () => Promise<User[]>;
    getById: (id: string) => Promise<User>;
    create: (dto: CreateUserDto) => Promise<User>;
    update: (id: string, dto: UpdateUserDto) => Promise<User>;
    delete: (id: string) => Promise<void>;
    getWithSoftware: (id: string) => Promise<{
        user: User;
        software: {
            id: any;
            name: any;
            version: any;
            license: any;
            seats: any;
            comment: any;
            ownerId: string;
            categoryId: any;
        }[];
    }>;
};
//# sourceMappingURL=users.service.d.ts.map