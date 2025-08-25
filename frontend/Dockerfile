FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create a minimal runtime image that just holds the dist files
FROM scratch
COPY --from=builder /app/dist /dist
CMD ["true"]
