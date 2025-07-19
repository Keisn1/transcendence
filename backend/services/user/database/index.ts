import sqlite3 from "sqlite3";
import path from "path";

const dbFile = path.resolve(__dirname, "../users.db");
const rawDb = new sqlite3.Database(dbFile, (err) => {
    if (err) console.error("SQLite connect error:", err);
});

// wrapper
export const db = {
    // imperative api methods
    run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
        return new Promise((resolve, reject) => {
            rawDb.run(sql, params, function (this: sqlite3.RunResult, err) {
                if (err) return reject(err);
                resolve(this);
            });
        });
    },
    // generic type <T>
    get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            rawDb.get(sql, params, (err, row) => {
                if (err) return reject(err);
                resolve(row as T | undefined);
            });
        });
    },
    exec(sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            rawDb.exec(sql, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    },
};
