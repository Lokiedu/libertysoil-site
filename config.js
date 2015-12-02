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
  }
};
