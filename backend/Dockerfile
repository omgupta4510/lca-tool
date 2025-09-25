FROM node:18-alpine

# Install python and build tools for native dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p database uploads

# Set permissions
RUN chmod -R 755 /app

EXPOSE 5000

# Start the application
CMD ["npm", "start"]