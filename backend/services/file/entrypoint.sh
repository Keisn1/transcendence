#!/bin/sh
set -e

CERT_SRC="/vault/init/fileservice.localhost.crt"
KEY_SRC="/vault/init/fileservice.localhost.key"
CERT_DST="/etc/ssl/certs/fileservice.crt"
KEY_DST="/etc/ssl/private/fileservice.key"

echo "⏳ Waiting for Vault to respond and /vault/init/.env to exist..."

while true; do
  # Check Vault health endpoint
  if curl -sf http://vault:8200/v1/sys/health > /dev/null; then
    # Check if .env file exists
    if [ -f /vault/init/.env ]; then
      break
    fi
  fi
  sleep 2
done

echo "✅ Vault is responding and /vault/init/.env exists."
. /vault/init/.env
export VAULT_FILESERVICE_ID
export VAULT_FILESERVICESECRET_ID

## Securely shred the .env file after loading secrets
#if [ -f /vault/init/.env ]; then
#  # Overwrite with random data 3 times (adjust as needed)
#  shred -u -n 3 -z /vault/init/.env
#fi
#or just rm -f /vault/init/.env //shred might not be available in the container yet

# Wait for the certificate files to be available
echo "⏳ Waiting for certificate and key from Vault..."
while [ ! -f "$CERT_SRC" ] || [ ! -f "$KEY_SRC" ]; do
  sleep 2
done

# Copy to target SSL paths (used by Fileservice)
cp "$CERT_SRC" "$CERT_DST"
cp "$KEY_SRC" "$KEY_DST"
echo "✅ Copied certificate and key to Fileservice container."

echo "🚀 Starting Fileservice server..."
exec npm start
