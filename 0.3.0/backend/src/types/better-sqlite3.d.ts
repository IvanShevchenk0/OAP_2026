declare module 'better-sqlite3' {
  // Мінімальні декларації типів, які використовуються в цьому проєкті.
  export interface RunResult {
    changes: number;
    lastInsertROWID?: number;
  }

  export class Statement {
    constructor(sql: string);
    run(...params: any[]): RunResult;
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }

  export default class Database {
    constructor(filename: string, options?: any);
    prepare(sql: string): Statement;
    exec(sql: string): void;
    pragma(stmt: string): any;
    close(): void;
  }

}
