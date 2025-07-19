import { FastifyRequest, FastifyReply } from "fastify";
import { genSaltSync, hashSync } from "bcrypt";

interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

interface RegisterResponse {
    id: number;
    username: string;
    email: string;
    avatar: string;
}

export default async function register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply,
): Promise<RegisterResponse> {
    const { username, email, password } = request.body;

    try {
        // Hash password (stays in auth service)
        const salt = genSaltSync(10);
        const passwordHash = hashSync(password, salt);

        // Store only user_id and password_hash in auth service
        const result = await request.server.db.run(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, passwordHash],
        );

        const userId = result.lastID;

        // Generate JWT
        const token = request.server.jwt.sign({
            id: userId,
            username: username,
            email: email,
        });

        return reply.status(201).send({
            token,
            user: {
                id: userId,
                username: username,
                email: email,
            },
        });
    } catch (err) {
        const error = err as Error;
        console.error("Registration error:", error);
        // More specific error handling
        if (error.message.includes("409")) {
            return reply.status(409).send({ error: "User already exists" });
        }
        if (error.message.includes("User service")) {
            return reply.status(502).send({ error: "External service unavailable" });
        }
        if (error.message.includes("UNIQUE constraint")) {
            return reply.status(409).send({ error: "User already exists" });
        }
        return reply.status(500).send({ error: "Registration failed" });
    }
}
