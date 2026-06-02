import { Request, Response, NextFunction } from 'express';
import { usersRepository } from '../repositories/users.repository';
import { ApiError } from './error-handler.middleware';

export type DemoUserRole = 'admin' | 'user' | 'guest';

export const demoAuth = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.header('X-Demo-UserId');

    // Якщо заголовок не передано — відхиляємо запит
    if (!userId) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Заголовок X-Demo-UserId обов’язковий');
    }

    // Гостьовий доступ без реального користувача
    if (userId === 'guest') {
        req.user = { id: 'guest', role: 'guest' };
        return next();
    }

    // Перевіряємо існування користувача у репозиторії
    const user = await usersRepository.getById(userId);
    if (!user) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Невідомий X-Demo-UserId');
    }

    req.user = {
        id: user.id,
        role: user.role === 'admin' ? 'admin' : 'user'
    };

    next();
};
