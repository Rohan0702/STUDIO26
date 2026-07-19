FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY OTP-Authentication/package*.json ./OTP-Authentication/

# Install dependencies
RUN cd OTP-Authentication && npm ci --only=production

# Copy all project files
COPY . .

# Set container port environment variable default
ENV PORT=8080
EXPOSE 8080

# Run the application
CMD ["node", "OTP-Authentication/server.js"]
