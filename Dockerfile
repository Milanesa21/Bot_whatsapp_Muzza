FROM node:18-bullseye-slim

WORKDIR /app

# Install curl for healthcheck and clean up in the same layer
RUN apt-get update && apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies first (caching layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Set production environment
ENV NODE_ENV=production

# Expose the single port that Railway will use
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]


