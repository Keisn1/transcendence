import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import vaultLib from "node-vault";

// Types for the encryption interface
interface EncryptionPlugin {
    encrypt2FASecret(secret: string): Promise<string>;
    decrypt2FASecret(encryptedSecret: string): Promise<string>;
    isEncryptionReady(): boolean;
}

// Utility to wait for Vault secret (copied from server.ts)
type VaultClient = ReturnType<typeof vaultLib>;

async function encryptionPlugin(server: FastifyInstance, options: { vault: VaultClient }) {
    let vaultReady = false;

    // Test Vault connection and transit key availability
    const initializeEncryption = async () => {
        try {
            console.log("🔐 Testing Vault transit engine connectivity...");

            // Test if we can access the transit key
            const testData = await options.vault.write("transit/encrypt/twofa-encryption", {
                plaintext: Buffer.from("test").toString("base64"),
            });

            if (testData.data && testData.data.ciphertext) {
                vaultReady = true;
                console.log("✅ Vault transit engine ready for 2FA encryption");
            } else {
                throw new Error("Transit key not accessible");
            }
        } catch (error) {
            console.error("❌ Failed to initialize Vault transit encryption:", error);
            throw error;
        }
    };

    const encryptionWrapper: EncryptionPlugin = {
        encrypt2FASecret: async (secret: string): Promise<string> => {
            if (!vaultReady) {
                throw new Error("Vault encryption not ready");
            }

            try {
                // Encode the secret as base64 for Vault
                const plaintext = Buffer.from(secret).toString("base64");

                const result = await options.vault.write("transit/encrypt/twofa-encryption", {
                    plaintext: plaintext,
                });

                if (!result.data || !result.data.ciphertext) {
                    throw new Error("Failed to encrypt 2FA secret");
                }

                return result.data.ciphertext;
            } catch (error) {
                console.error("Failed to encrypt 2FA secret:", error);
                throw new Error("Encryption failed");
            }
        },

        decrypt2FASecret: async (encryptedSecret: string): Promise<string> => {
            if (!vaultReady) {
                throw new Error("Vault encryption not ready");
            }

            try {
                const result = await options.vault.write("transit/decrypt/twofa-encryption", {
                    ciphertext: encryptedSecret,
                });

                if (!result.data || !result.data.plaintext) {
                    throw new Error("Failed to decrypt 2FA secret");
                }

                // Decode from base64
                const decrypted = Buffer.from(result.data.plaintext, "base64").toString("utf8");
                return decrypted;
            } catch (error) {
                console.error("Failed to decrypt 2FA secret:", error);
                throw new Error("Decryption failed");
            }
        },

        isEncryptionReady: (): boolean => {
            return vaultReady;
        },
    };

    // Initialize the encryption
    await initializeEncryption();

    server.decorate("encryption", encryptionWrapper);
}

async function encryptionPluginDevFunction(server: FastifyInstance) {
    let vaultReady = false;

    // Test Vault connection and transit key availability
    const initializeEncryption = async () => {
        try {
            vaultReady = true;
        } catch (error) {
            console.error("❌ Failed to initialize Vault transit encryption:", error);
            throw error;
        }
    };

    const encryptionWrapperDev: EncryptionPlugin = {
        encrypt2FASecret: async (secret: string): Promise<string> => {
            if (!vaultReady) {
                throw new Error("Vault encryption not ready");
            }

            try {
                return secret;
            } catch (error) {
                console.error("Failed to encrypt 2FA secret:", error);
                throw new Error("Encryption failed");
            }
        },

        decrypt2FASecret: async (encryptedSecret: string): Promise<string> => {
            if (!vaultReady) {
                throw new Error("Vault encryption not ready");
            }

            try {
                const decrypted = encryptedSecret;
                return decrypted;
            } catch (error) {
                console.error("Failed to decrypt 2FA secret:", error);
                throw new Error("Decryption failed");
            }
        },

        isEncryptionReady: (): boolean => {
            return vaultReady;
        },
    };

    // Initialize the encryption
    await initializeEncryption();

    server.decorate("encryption", encryptionWrapperDev);
}

export default fp(encryptionPlugin);
export const encryptionPluginDev = fp(encryptionPluginDevFunction);
