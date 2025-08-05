import { FastifyInstance } from "fastify";
import healthRoute from "./health";
import login, { loginSchema } from "../controllers/login.controller";
import register, { registerSchema } from "../controllers/register.controller";
import update, { updateUserSchema } from "../controllers/update.controller";
import getProfile, { getCurrentUserSchema } from "../controllers/getProfile.controller";

import { complete2FASchema } from "../controllers/twofa.controller";
import { init2FA, complete2FA } from "../controllers/twofa.controller";

export async function routes(fastify: FastifyInstance) {
    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.post("/signup", { schema: registerSchema }, register); // incorporates user creation
            fastify.post("/login", { schema: loginSchema }, login);
            fastify.get("/health", healthRoute);
            fastify.register((fastify: FastifyInstance) =>
            {
                fastify.post("/init", { preHandler: fastify.jwtAuth }, init2FA);
                fastify.post("/complete", { preHandler: fastify.jwtAuth, schema: complete2FASchema }, complete2FA);
            },
            { prefix: "2fa" },)
        },
        { prefix: "auth" },
    );
    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.get("", { preHandler: fastify.jwtAuth, schema: getCurrentUserSchema }, getProfile);
            fastify.put("", { preHandler: fastify.jwtAuth, schema: updateUserSchema }, update);
            fastify.get("/health", healthRoute);
        },
        { prefix: "user" },
    );
}
