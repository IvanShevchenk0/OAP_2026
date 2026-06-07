import fs from 'fs';
import path from 'path';

export async function runMigrations(db: any) {
  const migrationsDir = path.resolve(__dirname, '../../migrations');
  if (!fs.existsSync(migrationsDir)) return;

  await db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL
  );`);

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.match(/^\d+_.*\.sql$/))
    .sort();

  for (const file of files) {
    const full = path.join(migrationsDir, file);

    const row = await db.get(`SELECT 1 FROM schema_migrations WHERE filename = ${db.escape(file)}`);
    if (row) continue;

    const sql = fs.readFileSync(full, 'utf8');
    console.log(`Застосовую міграцію: ${file}`);
    await db.exec(sql);
    await db.exec(`INSERT INTO schema_migrations (filename, applied_at) VALUES (${db.escape(file)}, ${db.escape(new Date().toISOString())})`);
  }
}

export default runMigrations;
