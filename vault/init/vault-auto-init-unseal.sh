#!/bin/sh
set -e

# Remove completion marker if it exists (force removal, no error if missing)
rm -f /vault/init/.vault-ready

INIT_FILE="/vault/init/vault-init.json"

echo "Checking Vault initialization status..."
if vault status -address="$VAULT_ADDR" | grep 'Initialized.*false'; then
  echo "Vault not initialized, running init..."
  vault operator init -key-shares=5 -key-threshold=3 -format=json > /vault/init/vault-init.json
else
  echo "Vault already initialized, skipping init."
fi


echo "Unsealing Vault..."
UNSEAL_KEYS=$(jq -r '.unseal_keys_b64[]' "$INIT_FILE")

for key in $UNSEAL_KEYS; do
  vault operator unseal "$key"
done

echo "logging in with root token..."
# Login with root token
ROOT_TOKEN=$(jq -r '.root_token' $INIT_FILE)
echo "Logged in with root token."

UNSEAL_KEY_1=$(jq -r '.unseal_keys_b64[0]' /vault/init/vault-init.json)
UNSEAL_KEY_2=$(jq -r '.unseal_keys_b64[1]' /vault/init/vault-init.json)
UNSEAL_KEY_3=$(jq -r '.unseal_keys_b64[2]' /vault/init/vault-init.json)
echo "catting hard rn."
cat << EOF > /vault/init/.env
VAULT_ROOT_TOKEN=$ROOT_TOKEN
VAULT_UNSEAL_KEY_1=$UNSEAL_KEY_1
VAULT_UNSEAL_KEY_2=$UNSEAL_KEY_2
VAULT_UNSEAL_KEY_3=$UNSEAL_KEY_3
EOF
export VAULT_TOKEN=$ROOT_TOKEN


# --- Enable AppRole Auth Method ---
echo "Enabling AppRole auth method..."
vault auth enable approle || echo "AppRole already enabled."

echo "Enabling KV v2 secrets engine at 'secret/'..."
vault secrets enable -path=secret kv-v2 || echo "KV secret engine already enabled at secret/."

#JWT SECRET GENERATION
# Generate a random key using Vault itself
JWT_SECRET=$(vault write -field=random_bytes sys/tools/random bytes=64 | base64)

# Store it in the KV store
vault kv put secret/jwt key="$JWT_SECRET"
echo "Stored JWT secret in Vault:"
#vault kv get -field=key secret/jwt

# --- Create Vault policy for AppRole ---
cat <<EOF > /vault/init/user-policy.hcl
path "secret/data/users/*" {
  capabilities = ["create", "update", "read"]
}
path "pki/*" {
  capabilities = ["read", "create", "update", "list"]
}
path "sys/mounts" {
  capabilities = ["read", "list"]
}
path "pki/roles/https-cert-role" {
  capabilities = ["read", "create", "update"]
}
path "secret/data/jwt" {
  capabilities = ["read"]
}
path "transit/encrypt/twofa-encryption" {
  capabilities = ["update"]
}
path "transit/decrypt/twofa-encryption" {
  capabilities = ["update"]
}
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
EOF

echo "Writing user-policy..."
vault policy write user-policy /vault/init/user-policy.hcl || echo "policy has already been written."

# --- Create AppRole tied to the policy ---
vault write auth/approle/role/backend-role \
    token_policies="user-policy" \
    token_ttl=1h \
    token_max_ttl=4h


#approle for file-service read only
cat <<EOF > /vault/init/fileservice-policy.hcl
# Allow reading the JWT secret
path "secret/data/jwt" {
  capabilities = ["read"]
}
path "pki/*" {
  capabilities = ["read"]
}
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
EOF
vault policy write fileservice-policy /vault/init/fileservice-policy.hcl || echo "policy has already been written."

vault write auth/approle/role/fileservice-role \
    token_policies="fileservice-policy" \
    token_ttl=1h \
    token_max_ttl=4h


#approle end

#approle for match-service read only
cat <<EOF > /vault/init/matchservice-policy.hcl
# Allow reading the JWT secret
path "secret/data/jwt" {
  capabilities = ["read"]
}
path "pki/*" {
  capabilities = ["read"]
}
path "auth/token/lookup-self" {
  capabilities = ["read"]
}
EOF
vault policy write matchservice-policy /vault/init/matchservice-policy.hcl || echo "policy has already been written."

vault write auth/approle/role/matchservice-role \
    token_policies="matchservice-policy" \
    token_ttl=1h \
    token_max_ttl=4h


#approle end




cat /vault/init/.env >> /transcendence/.env
rm /vault/init/.env # && rm /vault/init/vault-init.json # add in prod maybe. maybe risky. maybe unnecessary, idk
echo "check .env now"

echo "Vault is unsealed and ready."

# --- Enable and configure PKI secrets engine for HTTPS certificates ---
echo "Enabling PKI secrets engine..."
vault secrets enable -path=pki pki || echo "PKI already enabled."

# Tune the PKI secrets engine to have a max lease TTL of 87600h (10 years)
vault secrets tune -max-lease-ttl=87600h pki

# Generate root CA (self-signed)
echo "Generating root CA..."
vault write -field=certificate pki/root/generate/internal \
    common_name="pong.localhost" \
    ttl=87600h > /vault/init/ca_cert.crt

# Configure URLs for issuing certificates and CRL distribution
echo "Configuring URLs for PKI..."
vault write pki/config/urls \
    issuing_certificates="http://localhost:8200/v1/pki/ca" \
    crl_distribution_points="http://localhost:8200/v1/pki/crl"

# Create a role for issuing HTTPS certificates
echo "Creating PKI role for HTTPS..."
vault write pki/roles/https-cert-role \
    allowed_domains="pong.localhost,match-service,file-service,auth-service" \
    allow_subdomains=true \
    allow_bare_domains=true \
    max_ttl="72h"

echo "PKI secrets engine configured for HTTPS certificates."

# --- Issue certificate and save .crt and .key for Nginx ---
DOMAIN="pong.localhost"
CERT_PATH="/vault/init/${DOMAIN}.crt"
KEY_PATH="/vault/init/${DOMAIN}.key"

echo "Requesting certificate for $DOMAIN..."
vault write -format=json pki/issue/https-cert-role \
    common_name="$DOMAIN" \
    ttl="72h" > /vault/init/cert.json

# Extract certificate, issuing CA, and private key
CRT=$(jq -r '.data.certificate' /vault/init/cert.json)
CA=$(jq -r '.data.issuing_ca' /vault/init/cert.json)
KEY=$(jq -r '.data.private_key' /vault/init/cert.json)

# Save certificate and key for Nginx
echo "$CRT" > "$CERT_PATH"
echo "$CA" >> "$CERT_PATH"
echo "$KEY" > "$KEY_PATH"

echo "Certificate and key generated: $CERT_PATH, $KEY_PATH"

# --- Issue certificate and save .crt and .key for NGINX <-> auth-service connection ---
INTERNAL_DOMAIN="auth-service.localhost"
INTCERT_PATH="/vault/init/${INTERNAL_DOMAIN}.crt"
INTKEY_PATH="/vault/init/${INTERNAL_DOMAIN}.key"

echo "Requesting internal certificate for $INTERNAL_DOMAIN..."
vault write -format=json pki/issue/https-cert-role \
    common_name="$INTERNAL_DOMAIN" \
    ttl="72h" > /vault/init/internal-cert.json

# Extract cert, issuing CA, and private key
CRT=$(jq -r '.data.certificate' /vault/init/internal-cert.json)
CA=$(jq -r '.data.issuing_ca' /vault/init/internal-cert.json)
KEY=$(jq -r '.data.private_key' /vault/init/internal-cert.json)

# Save cert and key to shared init dir
echo "$CRT" > "$INTCERT_PATH"
echo "$CA" >> "$INTCERT_PATH"
echo "$KEY" > "$INTKEY_PATH"

echo "Internal cert and key saved to $INTCERT_PATH and $INTKEY_PATH"

#NEW FOR FILESERVICE CERTS
# --- Issue certificate and save .crt and .key for FILESERVICE connection ---
INTERNAL_DOMAIN="fileservice.localhost"
INTCERT_PATH="/vault/init/${INTERNAL_DOMAIN}.crt"
INTKEY_PATH="/vault/init/${INTERNAL_DOMAIN}.key"

echo "Requesting internal certificate for $INTERNAL_DOMAIN..."
vault write -format=json pki/issue/https-cert-role \
    common_name="$INTERNAL_DOMAIN" \
    ttl="72h" > /vault/init/fileservice-cert.json

# Extract cert, issuing CA, and private key
CRT=$(jq -r '.data.certificate' /vault/init/fileservice-cert.json)
CA=$(jq -r '.data.issuing_ca' /vault/init/fileservice-cert.json)
KEY=$(jq -r '.data.private_key' /vault/init/fileservice-cert.json)

# Save cert and key to shared init dir
echo "$CRT" > "$INTCERT_PATH"
echo "$CA" >> "$INTCERT_PATH"
echo "$KEY" > "$INTKEY_PATH"

echo "Internal cert and key saved to $INTCERT_PATH and $INTKEY_PATH"
#FILESERVICE CERTS END

#NEW FOR MATCHSERVICE CERTS
# --- Issue certificate and save .crt and .key for matchservice connection ---
INTERNAL_DOMAIN="matchservice.localhost"
INTCERT_PATH="/vault/init/${INTERNAL_DOMAIN}.crt"
INTKEY_PATH="/vault/init/${INTERNAL_DOMAIN}.key"

echo "Requesting internal certificate for $INTERNAL_DOMAIN..."
vault write -format=json pki/issue/https-cert-role \
    common_name="$INTERNAL_DOMAIN" \
    alt_names="match-service" \
    ttl="72h" > /vault/init/matchservice-cert.json

# Extract cert, issuing CA, and private key
CRT=$(jq -r '.data.certificate' /vault/init/matchservice-cert.json)
CA=$(jq -r '.data.issuing_ca' /vault/init/matchservice-cert.json)
KEY=$(jq -r '.data.private_key' /vault/init/matchservice-cert.json)

# Save cert and key to shared init dir
echo "$CRT" > "$INTCERT_PATH"
echo "$CA" >> "$INTCERT_PATH"
echo "$KEY" > "$INTKEY_PATH"

echo "Internal cert and key saved to $INTCERT_PATH and $INTKEY_PATH"
#MATCHSERVICE CERTS END



# --- Fetch Role ID and Secret ID ---
export ROLE_ID=$(vault read -field=role_id auth/approle/role/backend-role/role-id)
export SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/backend-role/secret-id)

export ROLEFILESERVICE_ID=$(vault read -field=role_id auth/approle/role/fileservice-role/role-id)
export SECRETFILESERVICE_ID=$(vault write -f -field=secret_id auth/approle/role/fileservice-role/secret-id)

export ROLEMATCHSERVICE_ID=$(vault read -field=role_id auth/approle/role/matchservice-role/role-id)
export SECRETMATCHSERVICE_ID=$(vault write -f -field=secret_id auth/approle/role/matchservice-role/secret-id)


cat << EOF >> /vault/init/.env
VAULT_FILESERVICE_ID=$ROLEFILESERVICE_ID
VAULT_FILESERVICESECRET_ID=$SECRETFILESERVICE_ID

VAULT_ROLE_ID=$ROLE_ID
VAULT_SECRET_ID=$SECRET_ID

VAULT_MATCHSERVICE_ID=$ROLEMATCHSERVICE_ID
VAULT_MATCHSERVICESECRET_ID=$SECRETMATCHSERVICE_ID

EOF
echo "AppRole credentials retrieved."




# Enable transit secrets engine for encryption as a service (using root token)
echo "Enabling transit secrets engine..."
vault secrets enable transit || echo "Transit already enabled."

# Create encryption key for 2FA secrets (using root token)
echo "Creating 2FA encryption key in transit engine..."
vault write -f transit/keys/twofa-encryption

echo "2FA encryption key 'twofa-encryption' created in transit engine"






#echo "VAULT_TOKEN before is: $VAULT_TOKEN" #DISABLE IN PROD
# --- Authenticate using AppRole ---
VAULT_TOKEN=$(vault write -field=token auth/approle/login role_id="$ROLE_ID" secret_id="$SECRET_ID")
echo "Logged in with AppRole token."
#echo "VAULT_TOKEN after is: $VAULT_TOKEN" #DISABLE IN PROD
echo "Vault KV and policies setup complete."

# Create completion marker file for services to check
touch /vault/init/.vault-ready
sleep 10


shred -vfz -n 3 /vault/init/auth-service.localhost.crt 2>/dev/null || true
shred -vfz -n 3 /vault/init/auth-service.localhost.key 2>/dev/null || true
shred -vfz -n 3 /vault/init/ca_cert.crt 2>/dev/null || true
shred -vfz -n 3 /vault/init/cert.json 2>/dev/null || true
shred -vfz -n 3 /vault/init/fileservice-cert.json 2>/dev/null || true
shred -vfz -n 3 /vault/init/fileservice-policy.hcl 2>/dev/null || true
shred -vfz -n 3 /vault/init/fileservice.localhost.crt 2>/dev/null || true
shred -vfz -n 3 /vault/init/fileservice.localhost.key 2>/dev/null || true
shred -vfz -n 3 /vault/init/internal-cert.json 2>/dev/null || true
shred -vfz -n 3 /vault/init/.env 2>/dev/null || true
shred -vfz -n 3 /vault/init/matchservice-cert.json 2>/dev/null || true
shred -vfz -n 3 /vault/init/matchservice-policy.hcl 2>/dev/null || true
shred -vfz -n 3 /vault/init/matchservice.localhost.key 2>/dev/null || true
shred -vfz -n 3 /vault/init/matchservice.localhost.crt 2>/dev/null || true
shred -vfz -n 3 /vault/init/pong.localhost.key 2>/dev/null || true
shred -vfz -n 3 /vault/init/pong.localhost.crt 2>/dev/null || true
shred -vfz -n 3 /vault/init/user-policy.hcl 2>/dev/null || true
# shred -vfz -n 3 /transcendence/.env 2>/dev/null || true
# shred -vfz -n 3 /vault/init/vault-init.json 2>/dev/null || true  # 

rm /vault/init/auth-service.localhost.crt
rm /vault/init/auth-service.localhost.key
rm /vault/init/ca_cert.crt
rm /vault/init/cert.json
rm /vault/init/fileservice-cert.json
rm /vault/init/fileservice-policy.hcl
rm /vault/init/fileservice.localhost.crt
rm /vault/init/fileservice.localhost.key
rm /vault/init/internal-cert.json
rm /vault/init/.env
rm /vault/init/matchservice-cert.json
rm /vault/init/matchservice-policy.hcl
rm /vault/init/matchservice.localhost.key
rm /vault/init/matchservice.localhost.crt
rm /vault/init/pong.localhost.key
rm /vault/init/pong.localhost.crt

rm /vault/init/user-policy.hcl
# rm /vault/init/vault-init.json
rm /transcendence/.env