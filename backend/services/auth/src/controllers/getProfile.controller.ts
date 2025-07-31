import { FastifyRequest, FastifyReply } from "fastify";

export default async function getProfile(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({ user: request.user });
}

export const getCurrentUserSchema = {
    response: {
        200: {
            type: "object",
            properties: {
                user: {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        username: { type: "string" },
                        email: { type: "string" },
                        avatar: { type: "string", format: "uri-reference" },
                    },
                    required: ["id", "username", "email", "avatar"],
                },
            },
        },
    },
} as const;
