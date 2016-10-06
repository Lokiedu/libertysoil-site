FROM mhart/alpine-node:6.7

WORKDIR /src
ADD . .

RUN apk add --update make gcc g++ python

RUN /bin/sed -i "s*host: '127.0.0.1'*host: process.env.REDIS_PORT_6379_TCP_ADDR*" server.js && \
  /bin/sed -i "s*port: 6379*port: process.env.REDIS_PORT_6379_TCP_PORT*" server.js && \
  /bin/sed -i "s*host: '127.0.0.1'*host: process.env.REDIS_PORT_6379_TCP_ADDR*" config.js && \
  /bin/sed -i "s*port: 6379*port: process.env.REDIS_PORT_6379_TCP_PORT*" config.js && \
  /bin/sed -i "s*knex migrate:latest*knex --env staging migrate:latest*" package.json

RUN npm update -g npm@3.10.8 && npm install && npm run webpack:build:prod

RUN apk del make gcc g++ python && \
  rm -rf /tmp/* /root/.npm /root/.node-gyp

EXPOSE 8000
CMD ["npm", "run", "docker-start"]
