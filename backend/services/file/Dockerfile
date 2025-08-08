# Use Node.js base image
FROM node:22

# Install jq
RUN apt-get update && apt-get install -y jq

# Set working directory
WORKDIR /app

# Copy source code
COPY src/ ./src/

# Copy package files
COPY tsconfig.json .
COPY package*.json ./

# Install
RUN npm install
RUN npm run build

COPY /entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port
EXPOSE 3001

# Start the service
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
