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
import { PostTournamentBody } from "../types/tournament.types";
import { postTournament, postTournamentSchema } from "../controllers/tournament.controller";
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
            fastify.post<{ Body: PostTournamentBody }>(
                "",
                { preHandler: fastify.jwtAuth, schema: postTournamentSchema },
                postTournament,
            );
        },
        { prefix: "tournament" },
    );

    // GDPR routes for service-to-service calls
    fastify.delete("/user/:userId/gdpr", deleteUserData);
    fastify.put("/user/:userId/anonymize", anonymizeUserData);
}
