interface RunResult {
    changes: number;
    lastInsertROWID?: number;
}
declare class DatabaseWrapper {
    private db;
    private readyPromise;
    constructor();
    private init;
    private ensureDefaultCategories;
    private persist;
    exec(sql: string): Promise<void>;
    prepare(sql: string): Promise<{
        run: (...params: any[]) => RunResult;
        get: (...params: any[]) => any;
        all: (...params: any[]) => any[];
    }>;
    getReady(): Promise<this>;
}
export declare const db: DatabaseWrapper;
export default db;
//# sourceMappingURL=db.d.ts.map