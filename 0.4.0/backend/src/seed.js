"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Seed script: наповнює БД тестовими даними
const db_1 = __importDefault(require("./db"));
const users_repository_1 = require("./repositories/users.repository");
const categories_repository_1 = require("./repositories/categories.repository");
const software_repository_1 = require("./repositories/software.repository");
async function seed() {
    console.log('Запуск seed: очищаю таблиці...');
    await db_1.default.exec('PRAGMA foreign_keys = OFF;');
    await db_1.default.exec('DELETE FROM software;');
    await db_1.default.exec('DELETE FROM users;');
    await db_1.default.exec('DELETE FROM categories;');
    await db_1.default.exec('PRAGMA foreign_keys = ON;');
    console.log('Додаю користувачів...');
    const u1 = await users_repository_1.usersRepository.add({ name: 'Ivan', email: 'ivan@example.com', role: 'admin' });
    const u2 = await users_repository_1.usersRepository.add({ name: 'Olena', email: 'olena@example.com', role: 'user' });
    console.log('Додаю категорії...');
    const c1 = await categories_repository_1.categoriesRepository.add({ name: 'Editor', platform: 'Windows' });
    const c2 = await categories_repository_1.categoriesRepository.add({ name: 'IDE', platform: 'Windows' });
    const c3 = await categories_repository_1.categoriesRepository.add({ name: 'Platform', platform: 'Windows' });
    console.log('Додаю ПО...');
    await software_repository_1.softwareRepository.add({ name: 'VS Code', version: '1.86', license: 'Free', seats: 10, comment: 'Editor', ownerId: u1.id, categoryId: c1.id });
    await software_repository_1.softwareRepository.add({ name: 'IntelliJ', version: '2023.1', license: 'Commercial', seats: 5, comment: 'IDE', ownerId: u2.id, categoryId: c2.id });
    await software_repository_1.softwareRepository.add({ name: 'Sublime', version: '4.0', license: 'Paid', seats: 3, comment: 'Editor', ownerId: u2.id, categoryId: c1.id });
    await software_repository_1.softwareRepository.add({ name: 'WebStorm', version: '2023.2', license: 'Commercial', seats: 2, comment: 'IDE', ownerId: u1.id, categoryId: c2.id });
    console.log('Seed завершено');
}
if (require.main === module) {
    seed()
        .then(() => {
        console.log('Seed completed successfully');
        process.exit(0);
    })
        .catch(err => {
        console.error('Seed failed:', err);
        process.exit(1);
    });
}
exports.default = seed;
//# sourceMappingURL=seed.js.map