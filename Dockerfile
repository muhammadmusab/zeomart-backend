# Set base image
FROM node:18

# Set working directory insdie the container
WORKDIR /app

# Copy package.json so that the next command "npm install" only runs when package.json changes
COPY package.json .
COPY tsconfig.json ./

RUN npm install

EXPOSE 4000

CMD ["npm", "run", "dev"]