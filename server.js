// Import Fastify
const fastify = require("fastify")({ logger: true });

// Define routes and handlers
fastify.get("/api/v1/hello", (request, reply) => {
  reply.send({ message: "Hello, World!" });
});

// // Start the server
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
