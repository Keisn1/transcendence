import { FastifyRequest, FastifyReply } from "fastify";
import { compareSync } from "bcrypt";

interface LoginBody {
    email: string;
    password: string;
}

export default async function login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const { email, password } = request.body;

    try {
        const userRecords = await request.server.db.query(
            "SELECT id, username, email, password_hash FROM users WHERE email = ?",
            [email],
        );

        if (!userRecords.length || !compareSync(password, userRecords[0].password_hash)) {
            return reply.status(401).send({ error: "Invalid credentials" });
        }

        const user = userRecords[0];

        // Generate JWT
        const token = request.server.jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
        });

        return reply.send({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return reply.status(500).send({ error: "Login failed" });
    }
}
