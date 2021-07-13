FROM node:12-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
#COPY ["package.json", "tsconfig.json"] /app

#RUN npm install -g 
#-s --no-progress yarn

COPY package.json /app

RUN npm install

# Bundle app source
COPY . /app

EXPOSE 3000

#CMD ["node", "./index.js"]
#CMD [ "yarn", "start" ]
ENTRYPOINT npm run start