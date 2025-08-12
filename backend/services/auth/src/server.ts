import Fastify from "fastify";
import { routes } from "./routes/routes";
import jwtPlugin from "./plugins/auth.plugin";
import dbPlugin from "./plugins/db.plugin";
import gdprPlugin from "./plugins/gdpr.plugin";
import encryptionPlugin, { encryptionPluginDev } from "./plugins/encryption.plugin";

import fs from "fs";
import vaultLib from "node-vault";

if (process.env.ENV === "production") {
    const server = Fastify({
        logger: true,
        https: {
            key: fs.readFileSync("/vault/init/auth-service.localhost.key"),
            cert: fs.readFileSync("/vault/init/auth-service.localhost.crt"),
        },
    });

    const vault = vaultLib({
        endpoint: process.env.VAULT_ADDR || "http://vault:8200",
    });

    const loginWithAppRole = async () => {
        const result = await vault.write("auth/approle/login", {
            role_id: process.env.VAULT_ROLE_ID,
            secret_id: process.env.VAULT_SECRET_ID,
        });
        vault.token = result.auth.client_token;
    };

    const start = async () => {
        try {
            await loginWithAppRole();
            const secretData = await waitForVaultSecret(vault, "/secret/data/jwt", 60, 2000);
            const jwtSecret = secretData.key;

            server.register(jwtPlugin, { jwtSecret });
            server.register(dbPlugin);
            server.register(encryptionPlugin, { vault });
            server.register(routes, { prefix: "api" });
            server.register(gdprPlugin, { prefix: "api" });

            await server.listen({ port: 3000, host: "0.0.0.0" });
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
    server.register(encryptionPluginDev);
    server.register(routes, { prefix: "api" });
    server.register(gdprPlugin, { prefix: "api" });
    server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
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
