// plugins/gdpr.plugin.ts
import { FastifyPluginAsync } from "fastify";
import speakeasy from "speakeasy";
interface GdprPluginOptions {
  vault: any; // typed vault client instance
}

const gdprPlugin: FastifyPluginAsync<GdprPluginOptions> = async (server, opts) => {
  const vault = opts.vault;

  // Require auth, replace with your actual auth hook if needed
  server.addHook("preHandler", async (request, reply) => {
    if (!request.user) {
      reply.code(401).send({ error: "Unauthorized" });
    }
  });

  server.post("/user/anonymize", async (request, reply) => {
    const username = request.user.username;
    const vaultPath = `secret/data/users/${username}`;
	//2fa verify first if 2fa is enabled (to do)
    try {
      const userSecret = await vault.read(vaultPath); //this is obviously placeholder and using only vault
      const oldData = userSecret.data.data; // , DB data needs to do something similar

      const anonymizedData = {
        ...oldData,
        email: `anon_${Date.now()}@example.com`,
        name: `anon_${Date.now()}`,
        is2FAEnabled: false,
        anonymized: true,
      };

      await vault.write(vaultPath, { data: anonymizedData });
	  //invalidate JWT token?
      reply.redirect("/index.html"); //maybe adjust? its supposed to be homepage
    } catch (err) {
      server.log.error(err);
      reply.status(500).send({ error: "Failed to anonymize user." });
    }
  });

  server.post("/user/delete", async (request, reply) => {
    const username = request.user.username;
    const vaultPath = `secret/data/users/${username}`; // KV v2 data path for delete
	//2fa verify first if 2fa is enabled (to do)
    try {
		//invalidate JWT token?
    	reply.redirect("/index.html"); //maybe adjust? its supposed to be homepage
    } catch (err) {
    	server.log.error(err);
    	reply.status(500).send({ error: "Failed to delete user account." });
    }
  });

  server.get("/user/data/download", async (request, reply) => {
  const username = request.user.username;
  const vaultPath = `secret/data/users/${username}`;

  try {
    const secretResp = await vault.read(vaultPath);	//might need to consolidate db and vault information.
    const userData = secretResp.data.data;

    // Set headers to trigger a file download with JSON content
    reply
      .header("Content-Type", "application/json")
      .header("Content-Disposition", `attachment; filename="${username}-personal-data.json"`);

    return JSON.stringify(userData, null, 2); // pretty JSON
  } catch (err) {
    server.log.error(err);
    reply.status(500).send({ error: "Failed to retrieve personal data." });
  }
});

};

export default gdprPlugin;
