FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
ENV HOST=0.0.0.0


# Expose port
EXPOSE 3000

# Use preview server for production
CMD ["npm", "run", "preview", "--", "--port", "3000"]