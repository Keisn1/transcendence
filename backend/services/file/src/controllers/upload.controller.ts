import { FastifyRequest, FastifyReply } from "fastify";
import path from "path";
import fs from "fs/promises";

export default async function uploadAvatar(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const data = await request.file();

    if (!data || !data.mimetype.startsWith("image/")) {
        return reply.code(400).send({ error: "Invalid file" });
    }

    const filename = `avatar-${Date.now()}.${data.filename.split(".").pop()}`;
    const filepath = path.join("/app/uploads", filename);

    await fs.writeFile(filepath, await data.toBuffer());

    return {
        filename,
        url: `/uploads/${filename}`,
    };
}
