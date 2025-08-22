import { FastifyRequest, FastifyReply } from "fastify";
import fs from "fs/promises";
import path from "path";

export default async function deleteAvatar(
    request: FastifyRequest<{ Params: { filename: string } }>,
    reply: FastifyReply,
) {
    const { filename } = request.params;

    // Don't delete default avatar
    if (filename === "default-pfp.png") {
        return reply.code(400).send({ error: "Cannot delete default avatar" });
    }

    try {
        const filepath = path.join("/app/uploads", filename);
        await fs.unlink(filepath);
        return reply.send({ success: true, message: "Avatar deleted" });
    } catch (error) {
        return reply.send({
            success: true,
            message: "Avatar already deleted or not found",
        });
    }
}
