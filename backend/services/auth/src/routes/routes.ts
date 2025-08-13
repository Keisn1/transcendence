import { FastifyInstance } from "fastify";
import healthRoute from "./health";
import { login, loginSchema } from "../controllers/login.controller";
import register, { registerSchema } from "../controllers/register.controller";
import getProfile, { getProfileSchema } from "../controllers/getProfile.controller";
import { deleteUser, anonymizeUser } from "../controllers/gdpr.controller";

import { complete2FASchema, disable2FA, verify2FA, verify2FASchema } from "../controllers/twofa.controller";
import { init2FA, complete2FA } from "../controllers/twofa.controller";
import updateUser, { getUserById, getUserByIdSchema, updateUserSchema } from "../controllers/updateUser.controller";

export async function routes(fastify: FastifyInstance) {
    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.post("/signup", { schema: registerSchema }, register); // incorporates user creation
            fastify.post("/login", { schema: loginSchema }, login);
            fastify.post("/verify", { schema: loginSchema }, login);
            fastify.get("/health", healthRoute);
            fastify.register(
                (fastify: FastifyInstance) => {
                    fastify.post("/init", { preHandler: fastify.jwtAuth }, init2FA);
                    fastify.post("/complete", { preHandler: fastify.jwtAuth, schema: complete2FASchema }, complete2FA);
                    fastify.post("/verify", { preHandler: fastify.jwtAuth, schema: verify2FASchema }, verify2FA);
                    fastify.post("/disable", { preHandler: fastify.jwtAuth, schema: verify2FASchema }, disable2FA);
                },
                { prefix: "2fa" },
            );
        },
        { prefix: "auth" },
    );
    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.put("", { preHandler: fastify.jwtAuth, schema: updateUserSchema }, updateUser);
            fastify.get<{ Params: { userId: string } }>(
                "/:userId",
                { preHandler: fastify.jwtAuth, schema: getUserByIdSchema },
                getUserById,
            );
            fastify.get("/health", healthRoute);
        },
        { prefix: "user" },
    );

    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.get("", { preHandler: fastify.jwtAuth, schema: getProfileSchema }, getProfile);
            fastify.get("/health", healthRoute);
        },
        { prefix: "profile" },
    );

    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.get("/delete", { preHandler: fastify.jwtAuth }, deleteUser);
            fastify.get("/anonymize", { preHandler: fastify.jwtAuth }, anonymizeUser);
        },
        { prefix: "gdpr" },
    );
}
