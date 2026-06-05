import { Request, Response, NextFunction } from 'express';
import { softwareService } from '../services/software.service';

export const softwareController = {
    // Контролер для роботи з переліком програмного забезпечення
    // Отримати весь список (GET /api/software)
    getAll: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const license = req.query.license as string;
            const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : undefined;
            const sortBy = req.query.sortBy as string | undefined;
            const sortOrder = req.query.sortOrder as string | undefined;

            const query: any = {};
            if (license) query.license = license;
            if (page !== undefined) query.page = page;
            if (pageSize !== undefined) query.pageSize = pageSize;
            if (sortBy) query.sortBy = sortBy;
            if (sortOrder) query.sortOrder = sortOrder;

            const result = await softwareService.getAll(query);
            res.status(200).json({ data: result.items, meta: { total: result.total } });
        } catch (error) {
            next(error);
        }
    },

    // Отримання одного елемента за ID (GET /api/software/:id)
    getById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const item = await softwareService.getById(id);
            res.status(200).json({ data: item });
        } catch (error) {
            next(error);
        }
    },

    // Експорт JSON-даних у форматі software + category + owner (GET /api/software/export)
    exportData: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const license = req.query.license as string | undefined;
            const result = await softwareService.exportData({ license });
            res.status(200).json({ data: result.items, meta: { total: result.total } });
        } catch (error) {
            next(error);
        }
    },

    // Створення нового запису (POST /api/software)
    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newItem = await softwareService.create(req.body);
            res.status(201).json({ data: newItem });
        } catch (error) {
            next(error);
        }
    },

    // Імпорт JSON-даних з обмеженнями (POST /api/software/import)
    importData: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const items = await softwareService.importItems(req.body.items);
            res.status(201).json({ data: items, meta: { imported: items.length } });
        } catch (error) {
            next(error);
        }
    },

    // Оновлення запису (PUT /api/software/:id)
    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const updatedItem = await softwareService.update(id, req.body);
            res.status(200).json({ data: updatedItem });
        } catch (error) {
            next(error);
        }
    },

    // Видалення запису (DELETE /api/software/:id)
    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await softwareService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },

    // Aggregation endpoint
    summary: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const summary = await softwareService.getSummary();
            res.status(200).json({ data: summary });
        } catch (err) {
            next(err);
        }
    },

    // Unsafe search (demonstration of SQLi)
    searchUnsafe: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const q = (req.query.q as string) || '';
            const items = await softwareService.searchUnsafe(q);
            res.status(200).json({ data: items, meta: { total: items.length } });
        } catch (err) {
            next(err);
        }
    }
};