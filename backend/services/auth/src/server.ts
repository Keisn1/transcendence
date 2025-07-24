import Fastify from "fastify";
import { routes } from "./routes/routes";
import jwtPlugin from "./plugins/auth.plugin";
import dbPlugin from "./plugins/db.plugin";

// //THIS IS NEW SHIT THAT CHRIS PUT HERE TO MAKE HTTPS WORK
import fs from "fs";
import vaultLib from "node-vault";

if (process.env.ENV === "production") {
    const server = require("fastify")({
        logger: true,
        https: {
            key: fs.readFileSync("/vault/init/fastify.localhost.key"),
            cert: fs.readFileSync("/vault/init/fastify.localhost.crt"),
        },
    }); //imports fastify and creates server
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
    server.register(jwtPlugin);
    // server.register(require("@fastify/jwt"), { secret: config.jwt.secret });
    server.register(dbPlugin);
    server.register(routes, { prefix: "api/user" });
    // server.listen({ port: 3000 }, (err: any, address: any) => {
    // if (err) {
    //     console.error(err);
    //     process.exit(1);
    // }
    // console.log(`Server listening at ${address}`);
    // });
    const start = async () => {
        try {
            await loginWithAppRole();
            await server.listen({ port: 3000, host: "0.0.0.0" });
            console.log("Server started!");
        } catch (err) {
            console.error("Failed to start:", err);
            process.exit(1);
        }
    };
    start();
}

if (process.env.ENV !== "production") {
    // Load environment variables
    require("dotenv").config();

    const server = Fastify({
        logger: true,
    });

    server.register(jwtPlugin);
    // server.register(require("@fastify/jwt"), { secret: config.jwt.secret });
    server.register(dbPlugin);
    server.register(routes, { prefix: "api/user" });

    server.listen({ port: 3000 }, (err: any, address: any) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
}
