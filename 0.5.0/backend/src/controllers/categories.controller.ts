import { Request, Response, NextFunction } from 'express';
import { categoriesService } from '../services/categories.service';

export const categoriesController = {
    getAll: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const items = await categoriesService.getAll();
            res.status(200).json(items);
        } catch (err) { next(err); }
    },

    getById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const item = await categoriesService.getById(id);
            res.status(200).json(item);
        } catch (err) { next(err); }
    },

    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newItem = await categoriesService.create(req.body);
            res.status(201).json(newItem);
        } catch (err) { next(err); }
    },

    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const updated = await categoriesService.update(id, req.body);
            res.status(200).json(updated);
        } catch (err) { next(err); }
    },

    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await categoriesService.delete(id);
            res.status(204).send();
        } catch (err) { next(err); }
    }
};
