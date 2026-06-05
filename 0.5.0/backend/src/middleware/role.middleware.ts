import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error-handler.middleware';

// Middleware для захисту адмін-ендпойнтів. Вимагає, щоб `req.user` був встановлений
// (з `authMiddleware`) і щоб роль була `admin`.
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Потрібно увійти для доступу до цього ресурсу');
  }

  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'Доступ дозволено лише адміністратору');
  }

  next();
};
