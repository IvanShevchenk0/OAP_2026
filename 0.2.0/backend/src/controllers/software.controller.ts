import { Request, Response, NextFunction } from 'express';
import { softwareService } from '../services/software.service';

export const softwareController = {
    // Отримати весь список (GET /api/software)
    getAll: (req: Request, res: Response, next: NextFunction) => {
        try {
            // Читання параметрів з URL (query params)
            const license = req.query.license as string;
            const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : undefined;

            // Передаємо параметри в сервіс, тільки якщо вони визначені
            const query: any = {};
            if (license) query.license = license;
            if (page !== undefined) query.page = page;
            if (pageSize !== undefined) query.pageSize = pageSize;

            const result = softwareService.getAll(query);
            res.status(200).json(result); // 200 OK
        } catch (error) {
            next(error);
        }
    },

    // Отримання одного елемента за ID (GET /api/software/:id)
    getById: (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const item = softwareService.getById(id);
            res.status(200).json(item);
        } catch (error) {
            next(error);
        }
    },

    // Створення нового запису (POST /api/software)
    create: (req: Request, res: Response, next: NextFunction) => {
        try {
            const newItem = softwareService.create(req.body);
            res.status(201).json(newItem); // 201 Created
        } catch (error) {
            next(error);
        }
    },

    // Оновлення запису (PUT /api/software/:id)
    update: (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const updatedItem = softwareService.update(id, req.body);
            res.status(200).json(updatedItem);
        } catch (error) {
            next(error);
        }
    },

    // Видалення запису (DELETE /api/software/:id)
    delete: (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            softwareService.delete(id);
            res.status(204).send(); // 204 No Content
        } catch (error) {
            next(error);
        }
    }
};