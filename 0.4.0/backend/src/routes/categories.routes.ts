import { Router } from 'express';
import { categoriesController } from '../controllers/categories.controller';

const router = Router();

router.get('/', categoriesController.getAll);
router.post('/', categoriesController.create);
router.get('/:id', categoriesController.getById);
router.put('/:id', categoriesController.update);
router.delete('/:id', categoriesController.delete);

export default router;
