import { FastifyRequest, FastifyReply } from "fastify";
import { genSaltSync, hashSync } from "bcrypt-ts";

interface RegisterBody {
    username: string;
    password: string;
    email: string;
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
    const { username, password, email } = request.body;

    try {
        // 1. Create user in User Service
        const userResponse = await fetch("http://user-service:3001/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email }),
        });

        if (!userResponse.ok) {
            const error = await userResponse.json();
            return reply.code(userResponse.status).send(error);
        }

        const user = await userResponse.json();

        // 2. Store auth credentials in Auth Service
        const salt = genSaltSync(10);
        const passwordHash = hashSync(password, salt);

        // Store in your auth database
        // server is a
        await request.server.db.query("INSERT INTO auth_credentials (user_id, password_hash, salt) VALUES (?, ?, ?)", [
            user.id,
            passwordHash,
            salt,
        ]);

        // 3. Generate JWT token
        const token = request.server.jwt.sign({ id: user.id, username: user.username }, { expiresIn: "24h" });

        return reply.code(201).send({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        return reply.code(500).send({ error: " Internal server error" });
    }
}
