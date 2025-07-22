// Load environment variables
require("dotenv").config();

import Fastify from "fastify";
import { routes } from "./routes/routes";
import databasePlugin from "./database/database";
// import { config } from "./config/environment";
import jwtPlugin from "./plugins/auth.plugin";

const server = Fastify({
    logger: true,
});

server.register(jwtPlugin);
// server.register(require("@fastify/jwt"), { secret: config.jwt.secret });
server.register(databasePlugin);
server.register(routes, { prefix: "api/user" });

server.listen({ port: 3000 }, (err: any, address: any) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
