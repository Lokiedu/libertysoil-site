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
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN
  },
  pickpoint: {
    key: process.env.PICKPOINT_API_KEY
  }
};
