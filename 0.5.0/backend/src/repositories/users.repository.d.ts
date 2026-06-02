import { User, CreateUserDto, UpdateUserDto } from '../dtos/users.dto';
export declare const usersRepository: {
    getAll: () => Promise<User[]>;
    getById: (id: string) => Promise<User | undefined>;
    add: (dto: CreateUserDto) => Promise<User>;
    update: (id: string, dto: UpdateUserDto) => Promise<User | null>;
    delete: (id: string) => Promise<boolean>;
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
    } | null>;
};
//# sourceMappingURL=users.repository.d.ts.map