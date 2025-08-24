import { FastifyInstance } from "fastify";
import {
    postMatch,
    postMatchSchema,
    getMatchById,
    getMatchSchema,
    getUserMatches,
    getUserMatchesSchema,
} from "../controllers/match.controller";
import { PostMatchBody } from "../types/match.types";
import { PostTournamentWithVerificationBody } from "../types/tournament.types";
import {
    postTournamentWithVerification,
    postTournamentWithVerificationSchema,
} from "../controllers/tournament.controller";
import { deleteUserData, anonymizeUserData } from "../controllers/gdpr.controller";

export async function routes(fastify: FastifyInstance) {
    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.post<{ Body: PostMatchBody }>(
                "",
                { preHandler: fastify.jwtAuth, schema: postMatchSchema },
                postMatch,
            );
            fastify.get<{ Params: { id: string } }>("/:id", { schema: getMatchSchema }, getMatchById);
            fastify.get<{ Params: { userId: string } }>(
                "/user/:userId",
                { preHandler: fastify.jwtAuth, schema: getUserMatchesSchema },
                getUserMatches,
            );
        },

        { prefix: "match" },
    );
    fastify.register(
        (fastify: FastifyInstance) => {
            // Add verified tournament endpoint
            fastify.post<{ Body: PostTournamentWithVerificationBody }>(
                "/verified",
                { preHandler: fastify.jwtAuth, schema: postTournamentWithVerificationSchema },
                postTournamentWithVerification,
            );
        },
        { prefix: "tournament" },
    );
}

export async function gdprRoutes(fastify: FastifyInstance) {
    fastify.delete("/delete/:userId", deleteUserData);
    fastify.put("/anonymize/:userId", anonymizeUserData);
}
