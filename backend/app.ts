import Fastify, { FastifyRequest } from "fastify";
import './database'; 
import { routes } from "./routes/routes";
import { FastifyJwtVerifyOptions } from "@fastify/jwt";
import { userRoutes } from "./routes/userRoutes";

const app = Fastify({
    logger: true,
});

// const SECRET = "supersecret";
// app.register(require("@fastify/jwt"), {
//     secret: SECRET,
// });

// app.addHook("onRequest", async (request, reply) => {
//     try {
//         await request.jwtVerify();
//     } catch (err) {
//         reply.send(err);
//     }
// });

app.register(routes, { prefix: "api" });
app.register(userRoutes, { prefix: "api/user" });

app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
