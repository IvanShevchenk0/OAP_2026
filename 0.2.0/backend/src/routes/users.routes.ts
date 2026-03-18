import { Router } from 'express';
import { usersController } from '../controllers/users.controller';

const router = Router();

// CRUD операції 
router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.delete);

export default router;