import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

// CRUD операції 
router.use(authMiddleware);
router.get('/', requireAdmin, usersController.getAll);
router.get('/:id', requireAdmin, usersController.getById);
router.get('/:id/with-software', requireAdmin, usersController.getWithSoftware);
router.post('/', requireAdmin, usersController.create);
router.put('/:id', requireAdmin, usersController.update);
router.delete('/:id', requireAdmin, usersController.delete);

export default router;