"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const initSqlJs = require('sql.js');
const runMigrations_1 = __importDefault(require("./migrations/runMigrations"));
const DB_DIR = path_1.default.resolve(__dirname, '../data');
const DB_PATH = path_1.default.join(DB_DIR, 'database.db');
class DatabaseWrapper {
    db;
    readyPromise;
    constructor() {
        this.readyPromise = this.init();
    }
    async init() {
        const sqlJsPath = path_1.default.dirname(require.resolve('sql.js'));
        const SQL = await initSqlJs({
            locateFile: (file) => {
                const normalizedFile = file.replace(/^dist[\\/]/, '');
                return path_1.default.join(sqlJsPath, normalizedFile);
            }
        });
        if (!fs_1.default.existsSync(DB_DIR)) {
            fs_1.default.mkdirSync(DB_DIR, { recursive: true });
        }
        if (fs_1.default.existsSync(DB_PATH)) {
            const data = fs_1.default.readFileSync(DB_PATH);
            this.db = new SQL.Database(new Uint8Array(data));
        }
        else {
            this.db = new SQL.Database();
        }
        this.db.run('PRAGMA foreign_keys = ON;');
        await (0, runMigrations_1.default)(this);
        this.persist();
        console.log(`SQLite ініціалізовано та міграції застосовано: ${DB_PATH}`);
    }
    persist() {
        const data = this.db.export();
        fs_1.default.writeFileSync(DB_PATH, Buffer.from(data));
    }
    async exec(sql) {
        if (!this.db) {
            await this.readyPromise;
        }
        this.db.run(sql);
        this.persist();
    }
    async prepare(sql) {
        if (!this.db) {
            await this.readyPromise;
        }
        const stmt = this.db.prepare(sql);
        return {
            run: (...params) => {
                stmt.bind(params);
                stmt.step();
                stmt.free();
                const result = this.db.exec('SELECT changes() AS changes;');
                const changes = result?.[0]?.values?.[0]?.[0] ?? 0;
                this.persist();
                return { changes };
            },
            get: (...params) => {
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
            all: (...params) => {
                stmt.bind(params);
                const rows = [];
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
exports.db = new DatabaseWrapper();
exports.default = exports.db;
//# sourceMappingURL=db.js.map