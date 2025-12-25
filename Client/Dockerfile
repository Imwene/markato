# Client Dockerfile
# Multi-stage build for optimized production image
# Cache bust: 2025-12-25-v2

# ============================================
# Stage 1: Dependencies
# ============================================
FROM oven/bun:1-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# ============================================
# Stage 2: Builder
# ============================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables (only public keys!)
ARG VITE_API_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_SQUARE_APP_ID
ARG VITE_SQUARE_LOCATION_ID

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_SQUARE_APP_ID=$VITE_SQUARE_APP_ID
ENV VITE_SQUARE_LOCATION_ID=$VITE_SQUARE_LOCATION_ID
ENV NODE_ENV=production

# Build the application
RUN bun run build:production

# ============================================
# Stage 3: Production with Nginx (non-root)
# ============================================
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create necessary directories and set permissions for non-root nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    # Create tmp directory for nginx
    mkdir -p /tmp/nginx && \
    chown -R nginx:nginx /tmp/nginx

# Switch to non-root user
USER nginx

# Expose unprivileged port
EXPOSE 8080

# Health check (use 127.0.0.1 to force IPv4, localhost may resolve to IPv6)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
