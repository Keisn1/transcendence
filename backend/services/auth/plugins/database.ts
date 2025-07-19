import fp from "fastify-plugin";
import sqlite3 from "sqlite3";
import { FastifyInstance } from "fastify";

interface DatabasePlugin {
    query(sql: string, params?: any[]): Promise<any[]>;
    run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;
}

async function databasePlugin(fastify: FastifyInstance) {
    const db = new sqlite3.Database("./auth.db");

    const dbWrapper: DatabasePlugin = {
        query: (sql: string, params: any[] = []) => {
            return new Promise((resolve, reject) => {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        },

        run: (sql: string, params: any[] = []) => {
            return new Promise((resolve, reject) => {
                db.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID, changes: this.changes });
                });
            });
        },
    };

    fastify.decorate("db", dbWrapper);

    fastify.addHook("onClose", async () => {
        return new Promise<void>((resolve) => {
            db.close((err) => {
                if (err) console.error("Error closing database:", err);
                resolve();
            });
        });
    });
}

export default fp(databasePlugin);
