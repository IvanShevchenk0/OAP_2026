// Репозиторій `software` (на SQLite)
// Підтримка фільтрації/сортування/пагінації на рівні SQL.
// Повертається { items, total } — total рахується окремим запитом.
// Зв'язок з users реалізовано через owner_id (foreign key).
import { v4 as uuidv4 } from 'uuid';
import { Software, CreateSoftwareDto, UpdateSoftwareDto } from '../dtos/software.dto';
import { Category } from '../dtos/category.dto';
import { User } from '../dtos/users.dto';
import db from '../db';

const ALLOWED_SORT_COLUMNS = new Set(['name', 'version', 'license', 'seats']);

export const softwareRepository = {
    // Репозиторій для CRUD-операцій над таблицею software
    getAll: async (options?: { license?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; limit?: number; offset?: number }) : Promise<{ items: Software[]; total: number }> => {
        const where: string[] = [];
        const params: any[] = [];

        if (options?.license) {
            where.push('license = ?');
            params.push(options.license);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

        let orderSql = '';
        if (options?.sortBy && ALLOWED_SORT_COLUMNS.has(options.sortBy)) {
            orderSql = `ORDER BY ${options.sortBy} ${options.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
        }

        const limitSql = (typeof options?.limit === 'number') ? `LIMIT ${options.limit}` : '';
        const offsetSql = (typeof options?.offset === 'number') ? `OFFSET ${options.offset}` : '';

        const totalStmt = await db.prepare(`SELECT COUNT(*) as cnt FROM software ${whereSql}`);
        const totalRow = totalStmt.get(...params) as any;
        const total = totalRow ? totalRow.cnt as number : 0;

        const sql = `SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software ${whereSql} ${orderSql} ${limitSql} ${offsetSql}`;
        const stmt = await db.prepare(sql);
        const items = stmt.all(...params) as Software[];

        return { items, total };
    },

    getSummary: async () => {
        const stmt = await db.prepare('SELECT COUNT(*) as total, SUM(seats) as sumSeats, AVG(seats) as avgSeats FROM software');
        const row = stmt.get();
        return { total: row?.total || 0, sumSeats: row?.sumSeats || 0, avgSeats: row?.avgSeats || 0 };
    },

    getExportData: async (options?: { license?: string | undefined }) => {
        const where: string[] = [];
        const params: any[] = [];

        if (options?.license) {
            where.push('s.license = ?');
            params.push(options.license);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const totalStmt = await db.prepare(`SELECT COUNT(*) as cnt FROM software s ${whereSql}`);
        const totalRow = totalStmt.get(...params) as any;
        const total = totalRow ? totalRow.cnt as number : 0;

        const sql = `SELECT s.id as software_id, s.name as software_name, s.version as software_version, s.license as software_license,
            s.seats as software_seats, s.comment as software_comment, s.owner_id as software_owner_id, s.category_id as software_category_id,
            c.id as category_id, c.name as category_name, c.platform as category_platform,
            u.id as user_id, u.name as user_name, u.email as user_email, u.role as user_role
          FROM software s
          LEFT JOIN categories c ON s.category_id = c.id
          LEFT JOIN users u ON s.owner_id = u.id
          ${whereSql}`;

        const stmt = await db.prepare(sql);
        const rows = stmt.all(...params) as any[];

        const items = rows.map(row => {
            const software: Software = {
                id: row.software_id,
                name: row.software_name,
                version: row.software_version,
                license: row.software_license,
                seats: row.software_seats,
                comment: row.software_comment,
                ownerId: row.software_owner_id,
                categoryId: row.software_category_id
            };
            const result: any = { ...software };

            if (row.category_id) {
                result.category = {
                    id: row.category_id,
                    name: row.category_name,
                    platform: row.category_platform
                } as Category;
            }

            if (row.user_id) {
                result.owner = {
                    id: row.user_id,
                    name: row.user_name,
                    email: row.user_email,
                    role: row.user_role
                } as User;
            }

            return result;
        });

        return { items, total };
    },

    existsByNameAndVersion: async (name: string, version: string): Promise<boolean> => {
        const stmt = await db.prepare('SELECT 1 FROM software WHERE name = ? AND version = ? LIMIT 1');
        const row = stmt.get(name, version) as any;
        return !!row;
    },

    // Уразливий приклад пошуку, який показує ризик SQL ін'єкцій.
    searchUnsafe: async (q: string) => {
        const sql = `SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software WHERE name LIKE '%${q}%' OR comment LIKE '%${q}%'`;
        const stmt = await db.prepare(sql);
        return stmt.all() as Software[];
    },

    getById: async (id: string): Promise<Software | undefined> => {
        const stmt = await db.prepare('SELECT id, name, version, license, seats, comment, owner_id as ownerId, category_id as categoryId FROM software WHERE id = ?');
        return stmt.get(id) as Software | undefined;
    },

    add: async (dto: CreateSoftwareDto): Promise<Software> => {
        const id = uuidv4();
        const stmt = await db.prepare('INSERT INTO software (id, name, version, license, seats, comment, owner_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        stmt.run(id, dto.name, dto.version, dto.license, dto.seats, dto.comment || null, (dto as any).ownerId || null, (dto as any).categoryId || null);
        return { id, ...dto } as Software;
    },

    update: async (id: string, dto: UpdateSoftwareDto): Promise<Software | null> => {
        const existing = await softwareRepository.getById(id);
        if (!existing) return null;

        const updated = { ...existing, ...dto, id } as Software;
        const stmt = await db.prepare('UPDATE software SET name = ?, version = ?, license = ?, seats = ?, comment = ?, owner_id = ?, category_id = ? WHERE id = ?');
        stmt.run(updated.name, updated.version, updated.license, updated.seats, updated.comment || null, (updated as any).ownerId || null, (updated as any).categoryId || null, id);
        return updated;
    },

    delete: async (id: string): Promise<boolean> => {
        const stmt = await db.prepare('DELETE FROM software WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }
};