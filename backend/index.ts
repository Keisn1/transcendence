import Fastify from "fastify";
import { routes } from "./routes/routes";

const server = Fastify({
    logger: true,
});

server.register(routes, { prefix: "/api" });

server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
