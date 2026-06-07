// Репозиторій `software` (на SQLite)
// Підтримка фільтрації/сортування/пагінації на рівні SQL.
// Повертається { items, total } — total рахується окремим запитом.
// Зв'язок з users реалізовано через owner_id (foreign key).
import { v4 as uuidv4 } from 'uuid';
import { Software, CreateSoftwareDto, UpdateSoftwareDto } from '../dtos/software.dto';
import db from '../db';

const ALLOWED_SORT_COLUMNS = new Set(['name', 'version', 'license', 'seats']);

export const softwareRepository = {
    // Репозиторій для CRUD-операцій над таблицею software
    getAll: async (options?: { license?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; limit?: number; offset?: number }) : Promise<{ items: Software[]; total: number }> => {
        const where: string[] = [];

        if (options?.license) {
            where.push(`license = ${db.escape(options.license)}`);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

        let orderSql = '';
        if (options?.sortBy && ALLOWED_SORT_COLUMNS.has(options.sortBy)) {
            orderSql = `ORDER BY ${options.sortBy} ${options.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
        }

        const limitSql = (typeof options?.limit === 'number') ? `LIMIT ${options.limit}` : '';
        const offsetSql = (typeof options?.offset === 'number') ? `OFFSET ${options.offset}` : '';

        const totalSql = `SELECT COUNT(*) as cnt FROM software ${whereSql}`;
        const totalRow = await db.get(totalSql) as any;
        const total = totalRow ? totalRow.cnt as number : 0;

        const sql = `SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software ${whereSql} ${orderSql} ${limitSql} ${offsetSql}`;
        const items = await db.all(sql) as Software[];

        return { items, total };
    },

    getSummary: async () => {
        const row = await db.get('SELECT COUNT(*) as total, SUM(seats) as sumSeats, AVG(seats) as avgSeats FROM software');
        return { total: row?.total || 0, sumSeats: row?.sumSeats || 0, avgSeats: row?.avgSeats || 0 };
    },

    // Небезпечний пошук: демонстрація SQL-ін'єкцій через конкатенацію рядків.
    searchUnsafe: async (q: string) => {
        const sql = `SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software WHERE name LIKE '%${q}%' OR comment LIKE '%${q}%'`;
        return await db.all(sql) as Software[];
    },

    // Пошук без параметризованих плейсхолдерів.
    search: async (q: string) => {
        const value = `%${q}%`;
        const sql = `SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software WHERE name LIKE ${db.escape(value)} OR comment LIKE ${db.escape(value)}`;
        return await db.all(sql) as Software[];
    },

    getById: async (id: string): Promise<Software | undefined> => {
        return await db.get(`SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software WHERE id = ${db.escape(id)}`) as Software | undefined;
    },

    add: async (dto: CreateSoftwareDto): Promise<Software> => {
        const id = uuidv4();
        await db.exec(`INSERT INTO software (id, name, version, license, seats, comment, owner_id, category_id) VALUES (${db.escape(id)}, ${db.escape(dto.name)}, ${db.escape(dto.version)}, ${db.escape(dto.license)}, ${db.escape(dto.seats)}, ${db.escape(dto.comment || null)}, ${db.escape((dto as any).ownerId || null)}, ${db.escape((dto as any).categoryId || null)})`);
        return { id, ...dto } as Software;
    },

    update: async (id: string, dto: UpdateSoftwareDto): Promise<Software | null> => {
        const existing = await softwareRepository.getById(id);
        if (!existing) return null;

        const updated = { ...existing, ...dto, id } as Software;
        await db.exec(`UPDATE software SET name = ${db.escape(updated.name)}, version = ${db.escape(updated.version)}, license = ${db.escape(updated.license)}, seats = ${db.escape(updated.seats)}, comment = ${db.escape(updated.comment || null)}, owner_id = ${db.escape((updated as any).ownerId || null)}, category_id = ${db.escape((updated as any).categoryId || null)} WHERE id = ${db.escape(id)}`);
        return updated;
    },

    delete: async (id: string): Promise<boolean> => {
        const result = await db.run(`DELETE FROM software WHERE id = ${db.escape(id)}`);
        return result.changes > 0;
    }
};