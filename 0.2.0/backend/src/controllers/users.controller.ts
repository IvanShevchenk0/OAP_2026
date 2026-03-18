import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';

export const usersController = {
    getAll: (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = usersService.getAll();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    },

    getById: (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = usersService.getById(id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    },

    create: (req: Request, res: Response, next: NextFunction) => {
        try {
            const newUser = usersService.create(req.body);
            res.status(201).json(newUser);
        } catch (error) {
            next(error);
        }
    },

    update: (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const updatedUser = usersService.update(id, req.body);
            res.status(200).json(updatedUser);
        } catch (error) {
            next(error);
        }
    },

    delete: (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            usersService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
};