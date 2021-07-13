FROM node:12-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json /app

RUN npm install

# Bundle app source
COPY . /app

EXPOSE 3000

ENTRYPOINT npm run start