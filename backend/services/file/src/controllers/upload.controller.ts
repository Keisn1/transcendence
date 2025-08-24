import { FastifyRequest, FastifyReply } from "fastify";
import path from "path";
import fs from "fs/promises";
import { validateAvatarFile } from "../utils/utils";

export default async function uploadAvatar(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const data = await request.file();

    if (!data) {
        return reply.code(400).send({ error: "No file provided" });
    }

    const validation = validateAvatarFile(data);
    if (!validation.valid) {
        return reply.status(400).send({ error: validation.error });
    }

    const filename = `avatar-${Date.now()}.${data.filename.split(".").pop()}`;
    const filepath = path.join("/app/uploads", filename);

    await fs.writeFile(filepath, await data.toBuffer());

    return {
        filename,
        url: `/uploads/${filename}`,
    };
}
