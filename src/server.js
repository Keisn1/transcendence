// Import Fastify
import Fastify from "fastify";
const fastify = Fastify({ logger: true });

import routes from "./routes/routes.js";

await fastify.register(routes);

// // Start the server
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
