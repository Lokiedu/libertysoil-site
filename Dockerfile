FROM mhart/alpine-iojs

WORKDIR /src
ADD . .

RUN apk-install make gcc g++ python

RUN /bin/sed -i "s*host: '127.0.0.1'*host: process.env.REDIS_PORT_6379_TCP_ADDR*" index.js && \
  /bin/sed -i "s*port: 6379*port: process.env.REDIS_PORT_6379_TCP_PORT*" index.js

RUN /bin/sed -i "s*http://localhost:8000*http://alpha.libertysoil.org*" src/config.js

RUN /bin/sed -i "s*knex migrate:latest*knex --env staging migrate:latest*" package.json

RUN npm install -g babel gulp knex && \
  npm install && \
  gulp build

RUN apk del make gcc g++ python && \
  rm -rf /tmp/* /root/.npm /root/.node-gyp

EXPOSE 8000
CMD ["npm", "run", "start"]
