# Backend
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Set environment variable for the port
ENV BACKEND_PORT=3000

# Expose the port
EXPOSE $PORT

CMD ["npm", "run", "start"]
