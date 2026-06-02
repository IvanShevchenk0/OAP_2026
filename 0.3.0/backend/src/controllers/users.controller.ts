import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';

export const usersController = {
    getAll: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await usersService.getAll();
            res.status(200).json({ data: users, meta: { total: users.length } });
        } catch (error) {
            next(error);
        }
    },

    getById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = await usersService.getById(id);
            res.status(200).json({ data: user });
        } catch (error) {
            next(error);
        }
    },

    getWithSoftware: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const result = await usersService.getWithSoftware(id);
            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    },

    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newUser = await usersService.create(req.body);
            res.status(201).json({ data: newUser });
        } catch (error) {
            next(error);
        }
    },

    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const updatedUser = await usersService.update(id, req.body);
            res.status(200).json({ data: updatedUser });
        } catch (error) {
            next(error);
        }
    },

    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await usersService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
};