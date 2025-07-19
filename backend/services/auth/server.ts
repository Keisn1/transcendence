import Fastify from "fastify";
import { routes } from "./routes/routes";
import databasePlugin from "./plugins/database";

const server = Fastify({
    logger: true,
});

server.register(require("@fastify/jwt"), { secret: "supersecret" });
server.register(databasePlugin);
server.register(routes, { prefix: "api/auth" });

server.listen({ port: 3000 }, (err: any, address: any) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
