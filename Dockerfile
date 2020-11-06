FROM node:15-buster-slim
EXPOSE 3000

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  npm install --quiet node-gyp -g &&\
  npm install --quiet && \
  apk del native-deps

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . /usr/src/app
ENV NODE_ENV production

CMD [ "npm", "start" ]
