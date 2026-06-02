import { Software, CreateSoftwareDto, UpdateSoftwareDto } from '../dtos/software.dto';
export declare const softwareRepository: {
    getAll: (options?: {
        license?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        limit?: number;
        offset?: number;
    }) => Promise<{
        items: Software[];
        total: number;
    }>;
    getSummary: () => Promise<{
        total: any;
        sumSeats: any;
        avgSeats: any;
    }>;
    searchUnsafe: (q: string) => Promise<Software[]>;
    search: (q: string) => Promise<Software[]>;
    getById: (id: string) => Promise<Software | undefined>;
    add: (dto: CreateSoftwareDto) => Promise<Software>;
    update: (id: string, dto: UpdateSoftwareDto) => Promise<Software | null>;
    delete: (id: string) => Promise<boolean>;
};
//# sourceMappingURL=software.repository.d.ts.map