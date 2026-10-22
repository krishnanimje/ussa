# -------------------------------------------------------------
# Stage 1: Build Frontend and Server
# -------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy complete project source
COPY . .

# Run full production build (Vite client + esbuild server)
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Minimal Runner
# -------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled bundles and static assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/data ./data
COPY --from=builder /app/public ./public

# Configure persistent uploads and permissions for secure node user
RUN mkdir -p /app/public/uploads /app/data && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

CMD ["node", "dist-server/server.js"]
