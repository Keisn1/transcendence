import Fastify from "fastify";
import { routes } from "./routes/routes";

import Database from "better-sqlite3";

const db = new Database("./auth.db");

const server = Fastify({
    logger: true,
});

server.register(require("@fastify/jwt"), {
    secret: "supersecret", // Use environment variable in production
});

// Register database plugin (example with SQLite)
server.register(require("@fastify/sqlite"), {
    dbFile: "./auth.db",
});

server.register(routes, { prefix: "api/auth" });

server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
