// Репозиторій `users` (на SQLite)
// Реалізація CRUD для `users` через SQLite.
// Файл БД зберігається в `data/database.db`.
import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserDto, UpdateUserDto } from '../dtos/users.dto';
import db from '../db';
import { ApiError } from '../middleware/error-handler.middleware';

export const usersRepository = {
    getAll: async (): Promise<User[]> => {
        const stmt = await db.prepare('SELECT id, name, email, role FROM users');
        return stmt.all();
    },

    getById: async (id: string): Promise<User | undefined> => {
        const stmt = await db.prepare('SELECT id, name, email, role FROM users WHERE id = ?');
        return stmt.get(id) as User | undefined;
    },

    add: async (dto: CreateUserDto): Promise<User> => {
        const id = uuidv4();
        try {
            const stmt = await db.prepare('INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)');
            stmt.run(id, dto.name, dto.email, dto.role);
            return { id, ...dto } as User;
        } catch (err: any) {
            if (err && (String(err.message).includes('UNIQUE') || String(err.message).includes('constraint failed'))) {
                throw new ApiError(409, 'CONFLICT', `Користувач з email ${dto.email} вже існує`);
            }
            throw err;
        }
    },

    update: async (id: string, dto: UpdateUserDto): Promise<User | null> => {
        const existing = await usersRepository.getById(id);
        if (!existing) return null;

        const updated = { ...existing, ...dto, id } as User;
        const stmt = await db.prepare('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?');
        stmt.run(updated.name, updated.email, updated.role, id);
        return updated;
    },

    delete: async (id: string): Promise<boolean> => {
        const stmt = await db.prepare('DELETE FROM users WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    },
    // JOIN example: отримати користувача та його ПЗ (використовує JOIN)
    getWithSoftware: async (id: string) => {
        const sql = `SELECT u.id as user_id, u.name as user_name, u.email as user_email, u.role as user_role,
          s.id as software_id, s.name as software_name, s.version as software_version, s.license as software_license,
          s.seats as software_seats, s.comment as software_comment, s.category_id as software_category_id
        FROM users u LEFT JOIN software s ON s.owner_id = u.id WHERE u.id = ?`;
        const stmt = await db.prepare(sql);
        const rows = stmt.all(id) as any[];
        if (!rows || rows.length === 0) return null;
        const first = rows[0];
        const user = { id: first.user_id, name: first.user_name, email: first.user_email, role: first.user_role } as User;
        const software = rows.filter(r => r.software_id).map(r => ({ id: r.software_id, name: r.software_name, version: r.software_version, license: r.software_license, seats: r.software_seats, comment: r.software_comment, ownerId: id, categoryId: r.software_category_id }));
        return { user, software };
    }
};