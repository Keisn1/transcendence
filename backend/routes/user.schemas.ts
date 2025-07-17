export const createUserSchema = {
    body: {
        type: "object",
        properties: {
            username: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            avatar: { type: "string", format: "uri" },
        },
        required: ["username", "email", "avatar"],
        additionalProperties: false,
    },
    response: {
        201: {
            type: "object",
            properties: {
                id: { type: "number" },
                username: { type: "string" },
                email: { type: "string" },
                avatar: { type: "string" },
            },
        },
    },
} as const;
