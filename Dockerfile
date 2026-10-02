# Multi-stage Docker build for SignalForge Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build application
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

# Copy build artifacts and server file
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

# Install tsx globally or as runner dependency to execute server.ts in node
RUN npm install -g tsx

EXPOSE 3000

CMD ["tsx", "server.ts"]
