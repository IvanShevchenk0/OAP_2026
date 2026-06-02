import { CreateSoftwareDto, UpdateSoftwareDto, Software } from '../../../shared/dtos';
type DemoUser = {
    id: string;
    role: 'admin' | 'user' | 'guest';
} | undefined;
export declare const softwareService: {
    getAll: (query?: {
        license?: string;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortOrder?: string;
    }) => Promise<{
        items: import("../dtos/software.dto").Software[];
        total: number;
    }>;
    getById: (id: string, user?: DemoUser) => Promise<Software>;
    getSummary: () => Promise<{
        total: any;
        sumSeats: any;
        avgSeats: any;
    }>;
    searchUnsafe: (q: string) => Promise<import("../dtos/software.dto").Software[]>;
    search: (q: string) => Promise<import("../dtos/software.dto").Software[]>;
    create: (dto: CreateSoftwareDto, user?: DemoUser) => Promise<Software>;
    update: (id: string, dto: UpdateSoftwareDto, user?: DemoUser) => Promise<Software>;
    delete: (id: string, user?: DemoUser) => Promise<void>;
};
export {};
//# sourceMappingURL=software.service.d.ts.map