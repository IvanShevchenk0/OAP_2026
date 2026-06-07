import { Router } from 'express';
import { softwareController } from '../controllers/software.controller';

const router = Router();

// CRUD та JSON експорт/імпорт
router.get('/export', softwareController.exportData);      // Експорт JSON
router.post('/import', softwareController.importData);     // Імпорт JSON
router.get('/summary', softwareController.summary);    // Агрегація
router.get('/search', softwareController.searchUnsafe); // Небезпечний пошук (демонстрація SQLi)
router.get('/', softwareController.getAll);            // Отримати список
router.get('/:id', softwareController.getById);        // Отримати один за ID
router.post('/', softwareController.create);           // Створити
router.put('/:id', softwareController.update);         // Оновити
router.delete('/:id', softwareController.delete);      // Видалити

export default router;