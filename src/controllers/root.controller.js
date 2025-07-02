export async function getRoot(request, reply) {
  return reply.sendFile("index.html");
}
