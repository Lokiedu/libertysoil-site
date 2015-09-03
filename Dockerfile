FROM mhart/alpine-iojs

WORKDIR /src
ADD . .

RUN apk-install make gcc g++ python
RUN npm install -g babel gulp && \
  npm install && \
  gulp build
RUN apk del make gcc g++ python && \
  rm -rf /tmp/* /root/.npm /root/.node-gyp

EXPOSE 3000
CMD ["babel-node", "index.js"]