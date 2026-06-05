import { Request, Response, NextFunction } from 'express';
import { usersRepository } from '../repositories/users.repository';
import { authService } from '../services/auth.service';
import { ApiError } from './error-handler.middleware';

type TokenPayload = {
  id: string;
  role: 'admin' | 'user' | 'guest';
};

// Middleware: перевіряє Authorization Bearer токен, валідність JWT,
// наявність користувача в БД і встановлює `req.user = { id, role }`.
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.header('Authorization');
  if (!authorization) {
    // No Authorization header -> unauthorized
    throw new ApiError(401, 'UNAUTHORIZED', 'Заголовок Authorization обов’язковий');
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    // Authorization must be in format `Bearer <token>`
    throw new ApiError(401, 'UNAUTHORIZED', 'Заголовок Authorization має містити Bearer токен');
  }

  // Support a simple 'guest' token for demo scenarios
  if (token === 'guest') {
    req.user = { id: 'guest', role: 'guest' };
    return next();
  }

  let payload: TokenPayload;
  try {
    // verifyToken also checks revocation
    payload = authService.verifyToken(token);
  } catch (error) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Невірний або прострочений токен');
  }

  // Ensure user still exists in DB
  const user = await usersRepository.getById(payload.id);
  if (!user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Користувача не знайдено');
  }

  // Normalise role and attach to request
  req.user = { id: user.id, role: user.role === 'admin' ? 'admin' : 'user' };
  next();
};