FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
# Install 'serve' globally to serve built files
RUN npm install -g serve

EXPOSE 3000

# Serve the dist folder
CMD ["serve", "-s", "dist", "-l", "3000"]