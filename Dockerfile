FROM node:14-alpine
EXPOSE 3000

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# RUN apt update && apt install -y apt-transport-https ca-certificates python sqlite3
# RUN apk add --no-cache g++ git jq make python sqlite sqlite-dev \
#   && npm un sqlite3 -S \
#   && npm i --production \
#   && wget https://github.com/mapbox/node-sqlite3/archive/v5.0.0.zip -O /opt/sqlite3.zip \
#   && mkdir -p /opt/sqlite3 \
#   && unzip /opt/sqlite3.zip -d /opt/sqlite3 \
#   && cd /opt/sqlite3/node-sqlite3-5.0.0 \
#   && npm install \
#   && ./node_modules/.bin/node-pre-gyp install --fallback-to-build --build-from-source --sqlite=/usr/bin --python=$(which python) \
#   && cp -r /opt/sqlite3/node-sqlite3-5.0.0 /usr/src/app/node_modules/sqlite3 \
#   && apk del g++ git jq make python \
#   && rm -Rf /opt/sqlite3 /opt/sqlite3.zip

# COPY /opt/sqlite3/node-sqlite3-5.0.0 ./node_modules/sqlite3

# COPY package*.json ./
# RUN npm install --unsafe-perm --build-from-source

COPY . /usr/src/app
ENV NODE_ENV production

CMD [ "npm", "start" ]
