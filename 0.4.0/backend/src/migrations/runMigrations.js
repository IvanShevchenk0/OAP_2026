"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function runMigrations(db) {
    const migrationsDir = path_1.default.resolve(__dirname, '../../migrations');
    if (!fs_1.default.existsSync(migrationsDir))
        return;
    await db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL
  );`);
    const files = fs_1.default.readdirSync(migrationsDir)
        .filter(f => f.match(/^\d+_.*\.sql$/))
        .sort();
    for (const file of files) {
        const full = path_1.default.join(migrationsDir, file);
        const row = await db.get(`SELECT 1 FROM schema_migrations WHERE filename = ${db.escape(file)}`);
        if (row)
            continue;
        const sql = fs_1.default.readFileSync(full, 'utf8');
        console.log(`Застосовую міграцію: ${file}`);
        await db.exec(sql);
        await db.exec(`INSERT INTO schema_migrations (filename, applied_at) VALUES (${db.escape(file)}, ${db.escape(new Date().toISOString())})`);
    }
}
exports.default = runMigrations;
//# sourceMappingURL=runMigrations.js.map