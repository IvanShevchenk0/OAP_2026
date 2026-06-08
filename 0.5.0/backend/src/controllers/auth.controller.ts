import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  // Register a new user: validates input, hashes password and returns token
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register({ name, email, password });
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  // Login: verifies credentials, returns user + JWT token
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, req.ip ?? '');
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  // Logout: revoke the provided token (if any)
  logout: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = _req.header('Authorization');
      if (auth) {
        const parts = auth.split(' ');
        if (parts[0] === 'Bearer' && parts[1]) {
          authService.revokeToken(parts[1]);
        }
      }
      res.status(200).json({ data: { message: 'Logged out' } });
    } catch (error) {
      next(error);
    }
  }
};
