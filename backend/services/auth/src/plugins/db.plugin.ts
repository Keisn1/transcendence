import fp from "fastify-plugin";
import sqlite3 from "sqlite3";
import { FastifyInstance } from "fastify";
import path from "path";
import fs from "fs/promises";

async function runMigrations(db: any) {
    const migrationsDir = path.join(__dirname, "../migrations");

    // Ensure migrations table exists
    await db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const files = await fs.readdir(migrationsDir);
    const migrations = files.filter((f) => f.endsWith(".sql")).sort();

    for (const file of migrations) {
        const version = parseInt(file.split("_")[0]);

        // Use a transaction to make this atomic
        await db.exec("BEGIN TRANSACTION");

        try {
            const applied = await new Promise((resolve, reject) => {
                db.get("SELECT version FROM schema_migrations WHERE version = ?", [version], (err: any, row: any) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            console.log(applied);

            if (!applied) {
                // SQLite returns undefined for no results
                console.log(`Applying migration: ${file}`);
                const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
                await db.exec(sql);
                await db.run("INSERT INTO schema_migrations (version) VALUES (?)", version);
                console.log(`Applied migration: ${file}`);
            } else {
                console.log(`Already applied: ${file}`);
            }

            await db.exec("COMMIT");
        } catch (error) {
            await db.exec("ROLLBACK");
            throw error;
        }
    }
}

interface DatabasePlugin {
    query(sql: string, params?: any[]): Promise<any[]>;
    run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;
    store2FASecret(userId: string, secret: string): Promise<void>;
    get2FASecret(userId: string): Promise<string | null>;
    enable2FA(userId: string): Promise<void>;
    disable2FA(userId: string): Promise<void>;
}

async function dbPlugin(server: FastifyInstance) {
    const db = new sqlite3.Database("./db/auth.db");

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

        store2FASecret: async (userId: string, secret: string): Promise<void> => {
            // Wait for encryption plugin to be available
            await server.after();
            
            if (!server.encryption || !server.encryption.isEncryptionReady()) {
                throw new Error('Encryption not available');
            }
            
            const encryptedSecret = await server.encryption.encrypt2FASecret(secret);
            await dbWrapper.run(
                `UPDATE users SET twofa_secret = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [encryptedSecret, userId]
            );
        },

        get2FASecret: async (userId: string): Promise<string | null> => {
            // Wait for encryption plugin to be available
            await server.after();
            
            if (!server.encryption || !server.encryption.isEncryptionReady()) {
                throw new Error('Encryption not available');
            }
            
            const rows = await dbWrapper.query(`SELECT twofa_secret FROM users WHERE id = ?`, [userId]);
            const row = rows[0];
            
            if (!row?.twofa_secret) {
                return null;
            }
            
            try {
                return await server.encryption.decrypt2FASecret(row.twofa_secret);
            } catch (error) {
                console.error('Failed to decrypt 2FA secret:', error);
                throw new Error('Failed to decrypt 2FA secret');
            }
        },

        enable2FA: async (userId: string): Promise<void> => {
            await dbWrapper.run(
                `UPDATE users SET twofa_enabled = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [userId]
            );
        },

        disable2FA: async (userId: string): Promise<void> => {
            await dbWrapper.run(
                `UPDATE users SET twofa_enabled = 0, twofa_secret = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [userId]
            );
        },
    };

    // Run migrations on startup
    await runMigrations(db);

    server.decorate("db", dbWrapper);

    server.addHook("onClose", async () => {
        return new Promise<void>((resolve) => {
            db.close((err) => {
                if (err) console.error("Error closing database:", err);
                resolve();
            });
        });
    });
}

export default fp(dbPlugin);
