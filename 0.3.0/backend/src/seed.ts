// Скрипт seed: наповнює БД тестовими даними
import db from './db';
import { usersRepository } from './repositories/users.repository';
import { categoriesRepository } from './repositories/categories.repository';
import { softwareRepository } from './repositories/software.repository';

async function seed() {
  console.log('Запуск seed: очищаю таблиці...');
  await db.exec('PRAGMA foreign_keys = OFF;');
  await db.exec('DELETE FROM software;');
  await db.exec('DELETE FROM users;');
  await db.exec('DELETE FROM categories;');
  await db.exec('PRAGMA foreign_keys = ON;');

  console.log('Додаю користувачів...');
  const u1 = await usersRepository.add({ name: 'Ivan', email: 'ivan@example.com', role: 'admin' });
  const u2 = await usersRepository.add({ name: 'Olena', email: 'olena@example.com', role: 'user' });

  console.log('Додаю категорії...');
  const c1 = await categoriesRepository.add({ name: 'Editor', platform: 'Windows' });
  const c2 = await categoriesRepository.add({ name: 'IDE', platform: 'Windows' });
  const c3 = await categoriesRepository.add({ name: 'Platform', platform: 'Windows' });

  console.log('Додаю ПО...');
  await softwareRepository.add({ name: 'VS Code', version: '1.86', license: 'Free', seats: 10, comment: 'Editor', ownerId: u1.id, categoryId: c1.id } as any);
  await softwareRepository.add({ name: 'IntelliJ', version: '2023.1', license: 'Commercial', seats: 5, comment: 'IDE', ownerId: u2.id, categoryId: c2.id } as any);
  await softwareRepository.add({ name: 'Sublime', version: '4.0', license: 'Paid', seats: 3, comment: 'Editor', ownerId: u2.id, categoryId: c1.id } as any);
  await softwareRepository.add({ name: 'WebStorm', version: '2023.2', license: 'Commercial', seats: 2, comment: 'IDE', ownerId: u1.id, categoryId: c2.id } as any);

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

export default seed;
