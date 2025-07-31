// backend/services/file/src/index.ts
import Fastify from "fastify";
import uploadAvatar from "./controllers/upload.controller";
import { routes } from "./routes/routes";

const server = Fastify({ logger: true });

server.register(import("@fastify/multipart"), {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

server.register(import("@fastify/static"), {
    root: "/app/uploads",
    prefix: "/uploads",
});

// Routes
server.register(routes, { prefix: "api" });

server.listen({ host: "0.0.0.0", port: 3001 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🚀 Dev server listening at ${address}`);
});
