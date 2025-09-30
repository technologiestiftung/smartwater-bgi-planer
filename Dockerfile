# -------------- Dockerfile -----------------
# Use the official Node.js 22 image
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and lock file first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the project
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
# ------------------------------------------