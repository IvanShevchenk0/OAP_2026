import { Router } from 'express';
import { softwareController } from '../controllers/software.controller';

const router = Router();

// CRUD операції 
router.get('/', softwareController.getAll);           // Отримати список
router.get('/:id', softwareController.getById);       // Отримати один за ID
router.post('/', softwareController.create);          // Створити
router.put('/:id', softwareController.update);        // Оновити
router.delete('/:id', softwareController.delete);     // Видалити

export default router;