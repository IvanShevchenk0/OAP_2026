import { CreateSoftwareDto, UpdateSoftwareDto, Software } from '../../../shared/dtos';
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
    getById: (id: string) => Promise<Software>;
    getSummary: () => Promise<{
        total: any;
        sumSeats: any;
        avgSeats: any;
    }>;
    searchUnsafe: (q: string) => Promise<import("../dtos/software.dto").Software[]>;
    create: (dto: CreateSoftwareDto) => Promise<Software>;
    update: (id: string, dto: UpdateSoftwareDto) => Promise<Software>;
    delete: (id: string) => Promise<void>;
};
//# sourceMappingURL=software.service.d.ts.map