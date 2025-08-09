import { FastifyInstance } from "fastify";
import recordMatch, { recordMatchSchema } from "../controllers/match.controller";
import { MatchBody } from "../types/match.types";

export async function routes(fastify: FastifyInstance) {
    fastify.register( 
        (fastify: FastifyInstance) => {
            fastify.post<{ Body: MatchBody }>("/match", { preHandler: fastify.jwtAuth, schema: recordMatchSchema }, recordMatch);
        },
        { prefix: "api" },
    );
}