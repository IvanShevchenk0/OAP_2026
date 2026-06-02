import { Router } from 'express';
import { softwareController } from '../controllers/software.controller';
import { demoAuth } from '../middleware/demo-auth.middleware';

const router = Router();

// CRUD операції
router.get('/', softwareController.getAll);                     // Отримати список
router.get('/summary', softwareController.summary);             // Aggregation
router.get('/search-unsafe', softwareController.searchUnsafe);  // Небезпечний пошук (демонстрація SQLi)
router.get('/search', softwareController.search);               // Безпечний пошук
router.get('/:id', demoAuth, softwareController.getById);       // Отримати один за ID
router.post('/', demoAuth, softwareController.create);          // Створити
router.put('/:id', demoAuth, softwareController.update);        // Оновити
router.delete('/:id', demoAuth, softwareController.delete);     // Видалити

export default router;