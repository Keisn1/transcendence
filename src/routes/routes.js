import { getRoot } from "../controllers/root.controller.js";

export default async function routes(fastify, options) {
  fastify.get("/", getRoot);
}