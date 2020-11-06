FROM node:15-alpine
EXPOSE 3000

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . /usr/src/app
ENV NODE_ENV production

CMD [ "npm", "start" ]
