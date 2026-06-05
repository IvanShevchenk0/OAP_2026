import { Router } from 'express';
import { softwareController } from '../controllers/software.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// CRUD операції
router.get('/', softwareController.getAll);                     // Отримати список
router.get('/summary', softwareController.summary);             // Aggregation
router.get('/search-unsafe', softwareController.searchUnsafe);  // Небезпечний пошук (демонстрація SQLi)
router.get('/search', softwareController.search);               // Безпечний пошук
router.get('/:id', authMiddleware, softwareController.getById);       // Отримати один за ID
router.post('/', authMiddleware, softwareController.create);          // Створити
router.put('/:id', authMiddleware, softwareController.update);        // Оновити
router.delete('/:id', authMiddleware, softwareController.delete);     // Видалити

export default router;