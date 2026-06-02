import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
const initSqlJs: any = require('sql.js');
import runMigrations from './migrations/runMigrations';

const DB_DIR = path.resolve(__dirname, '../data');
const DB_PATH = path.join(DB_DIR, 'database.db');

interface RunResult {
  changes: number;
  lastInsertROWID?: number;
}

// Обгортка над sql.js для роботи з SQLite базою у файловій системі
class DatabaseWrapper {
  private db: any;
  private readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = this.init();
  }

  private async init() {
    // Завантажуємо sql.js та налаштовуємо шлях до WASM файлу
    const sqlJsPath = path.dirname(require.resolve('sql.js'));
    const SQL = await initSqlJs({
      locateFile: (file: string) => {
        const normalizedFile = file.replace(/^dist[\\/]/, '');
        return path.join(sqlJsPath, normalizedFile);
      }
    });

    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH);
      this.db = new SQL.Database(new Uint8Array(data));
    } else {
      this.db = new SQL.Database();
    }

    this.db.run('PRAGMA foreign_keys = ON;');
    await runMigrations(this);
    await this.ensureDefaultCategories();
    this.persist();
    console.log(`SQLite ініціалізовано та міграції застосовано: ${DB_PATH}`);
  }

  // Перевіряємо та додаємо стандартні категорії, якщо вони відсутні
  private async ensureDefaultCategories() {
    const defaultCategories = ['Editor', 'IDE', 'Platform'];
    for (const name of defaultCategories) {
      const stmt = await this.prepare('SELECT id FROM categories WHERE name = ?');
      const row = stmt.get(name);
      if (!row) {
        const insert = await this.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
        insert.run(uuidv4(), name);
      }
    }
  }

  private persist() {
    const data = this.db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }

  // Виконує SQL без повернення результатів
  async exec(sql: string) {
    if (!this.db) {
      await this.readyPromise;
    }
    this.db.run(sql);
    this.persist();
  }

  // Підготовка SQL виразу з можливістю виконання, отримання одного рядка або всіх рядків
  async prepare(sql: string) {
    if (!this.db) {
      await this.readyPromise;
    }
    const stmt = this.db.prepare(sql);

    return {
      run: (...params: any[]): RunResult => {
        stmt.bind(params);
        stmt.step();
        stmt.free();
        const result = this.db.exec('SELECT changes() AS changes;');
        const changes = result?.[0]?.values?.[0]?.[0] ?? 0;
        this.persist();
        return { changes };
      },

      get: (...params: any[]) => {
        stmt.bind(params);
        const hasRow = stmt.step();
        if (!hasRow) {
          stmt.free();
          return undefined;
        }
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      },

      all: (...params: any[]) => {
        stmt.bind(params);
        const rows: any[] = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      }
    };
  }

  async getReady() {
    await this.readyPromise;
    return this;
  }
}

export const db = new DatabaseWrapper();
export default db;
