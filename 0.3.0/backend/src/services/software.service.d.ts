import { CreateSoftwareDto, UpdateSoftwareDto, Software } from '../dtos/software.dto';
export declare const softwareService: {
    getAll: (query?: {
        license?: string;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortOrder?: string;
    }) => Promise<{
        items: Software[];
        total: number;
    }>;
    getById: (id: string) => Promise<Software>;
    getSummary: () => Promise<{
        total: any;
        sumSeats: any;
        avgSeats: any;
    }>;
    searchUnsafe: (q: string) => Promise<Software[]>;
    create: (dto: CreateSoftwareDto) => Promise<Software>;
    update: (id: string, dto: UpdateSoftwareDto) => Promise<Software>;
    delete: (id: string) => Promise<void>;
};
//# sourceMappingURL=software.service.d.ts.map