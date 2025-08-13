// backend/services/file/src/index.ts
import Fastify from "fastify";
import { gdprRoutes, routes } from "./routes/routes";
import jwtPlugin from "./plugins/auth.plugin";

//https
import fs from "fs";
import vaultLib from "node-vault";
import dbPlugin from "./plugins/db.plugin";

if (process.env.ENV === "production") {
    const server = Fastify({
        logger: true,
        https: {
            key: fs.readFileSync("/vault/init/matchservice.localhost.key"),
            cert: fs.readFileSync("/vault/init/matchservice.localhost.crt"),
        },
    });

    const vault = vaultLib({
        endpoint: process.env.VAULT_ADDR || "http://vault:8200",
    });

    const loginWithAppRole = async (maxRetries = 30, delayMs = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await vault.write("auth/approle/login", {
                role_id: process.env.VAULT_MATCHSERVICE_ID,
                secret_id: process.env.VAULT_MATCHSERVICESECRET_ID,
            });
            vault.token = result.auth.client_token;
            console.log(`✅ Successfully logged in with AppRole (attempt ${attempt})`);
            return;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.log(`⏳ Waiting for Vault AppRole login (attempt ${attempt}/${maxRetries})...`, errorMessage);
            if (attempt === maxRetries) {
                throw new Error(`Failed to login with AppRole after ${maxRetries} attempts: ${errorMessage}`);
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }};


    const start = async () => {
        try {
            await loginWithAppRole();
            const secretData = await waitForVaultSecret(vault, "/secret/data/jwt", 60, 2000);
            const jwtSecret = secretData.key;

            server.register(jwtPlugin, { jwtSecret });
            server.register(dbPlugin);
            server.register(routes, { prefix: "api" });
            server.register(gdprRoutes, { prefix: "gdpr" });

            await server.listen({ port: 3002, host: "0.0.0.0" });
            console.log("✅ Production server started");
        } catch (err) {
            console.error("❌ Failed to start server:", err);
            process.exit(1);
        }
    };

    start();
} else {
    require("dotenv").config();

    const server = Fastify({ logger: true });
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required");

    server.register(jwtPlugin, { jwtSecret }); // jwtAuth decorator only
    server.register(dbPlugin);
    server.register(routes, { prefix: "api" });
    server.register(gdprRoutes, { prefix: "gdpr" });

    server.listen({ port: 3002, host: "0.0.0.0" }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`🚀 Dev server listening at ${address}`);
    });
}

// Utility to wait for Vault secret
type VaultClient = ReturnType<typeof vaultLib>;

async function waitForVaultSecret(vault: VaultClient, path: string, maxRetries = 30, delayMs = 2000): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await vault.read(path);
            return res.data.data;
        } catch (err) {
            console.log(`Waiting for Vault secret at "${path}" (attempt ${attempt}/${maxRetries})...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    throw new Error(`Secret at path "${path}" was not available after ${maxRetries} attempts.`);
}
