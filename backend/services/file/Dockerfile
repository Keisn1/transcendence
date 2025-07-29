# Use Node.js base image
FROM node:22

# Install jq
RUN apt-get update && apt-get install -y jq

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3001

# Start the service
CMD ["npm", "start"]
