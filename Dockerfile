# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies needed for building)
RUN npm ci

# Copy application source code
COPY . .

# Build the client assets and compile the backend server
RUN npm run build

# Stage 2: Serve the application in production
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package manifests for runtime dependencies
COPY package.json package-lock.json ./

# Install production dependencies only (keeps the image size minimal)
RUN npm ci --only=production

# Copy the built output from builder stage
COPY --from=builder /app/dist ./dist

# Expose port (Cloud Run defaults to routing traffic to 8080)
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
