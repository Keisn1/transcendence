# Use Node.js base image
FROM node:22

# Install jq
RUN apt-get update && apt-get install -y jq

# Set working directory
WORKDIR /app

# Copy everything
COPY . .
# Copy backend
COPY tsconfig.json .
COPY package*.json .
RUN npm install
RUN npm run build

# ⬅️ Copy the entrypoint script into the root of the container
COPY /entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port
EXPOSE 3000

# Use custom entrypoint to wait for Vault setup
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

