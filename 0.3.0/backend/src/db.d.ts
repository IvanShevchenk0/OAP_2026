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
    private toObjectArray;
    private toObject;
    escape(value: any): string;
    exec(sql: string): Promise<void>;
    run(sql: string): Promise<RunResult>;
    get(sql: string): Promise<any>;
    all(sql: string): Promise<any[]>;
    getReady(): Promise<this>;
}
export declare const db: DatabaseWrapper;
export default db;
//# sourceMappingURL=db.d.ts.map