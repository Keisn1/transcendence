import { FastifyInstance } from "fastify";
import { postMatch, postMatchSchema, getMatchById, getMatchSchema } from "../controllers/match.controller";
import { PostMatchBody } from "../types/match.types";
import { PostTournamentBody } from "../types/tournament.types";
import { postTournament, postTournamentSchema } from "../controllers/tournament.controller";

export async function routes(fastify: FastifyInstance) {
    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.post<{ Body: PostMatchBody }>(
                "",
                { preHandler: fastify.jwtAuth, schema: postMatchSchema },
                postMatch,
            );
            fastify.get<{ Params: { id: string } }>("/:id", { schema: getMatchSchema }, getMatchById);
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
}
