import { Router } from 'express';
import { softwareController } from '../controllers/software.controller';

const router = Router();

// CRUD операції 
router.get('/', softwareController.getAll);           // Отримати список
router.get('/:id', softwareController.getById);       // Отримати один за ID
router.get('/summary', softwareController.summary);   // Aggregation
router.get('/search', softwareController.searchUnsafe); // Небезпечний пошук (демонстрація SQL-ін'єкцій)
router.post('/', softwareController.create);          // Створити
router.put('/:id', softwareController.update);        // Оновити
router.delete('/:id', softwareController.delete);     // Видалити

export default router;