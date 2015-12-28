module.exports = {
  attachments: {
    s3: {
      signatureVersion: 'v4',
      params: {
        Bucket: 'libertysoil-b1',
        ACL: 'public-read'
      }
    },
    prefix: 'attachments/',
    supportedImageFormats: [
      'image/jpeg',
      'image/png',
      'image/gif'
    ]
  },
  pickpoint: {
    key: process.env.PICKPOINT_API_KEY
  },
  kue: {
    redis: {
      host: '127.0.0.1',
      port: 6379,
      db: 1 // if provided select a non-default redis db
      // options: {
      //   // see https://github.com/mranney/node_redis#rediscreateclient
      // }
    }
  }
};
