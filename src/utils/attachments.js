import AWS from 'aws-sdk';
import bluebird from 'bluebird';
import crypto from 'crypto';

import config from '../../config';

const s3 = bluebird.promisifyAll(new AWS.S3(config.attachments.s3));

/**
 * Uploads the file to the bucket specified in config.attachments.s3.Bucket.
 * @param {String} fileName
 * @param {*} fileData An arbitrarily sized buffer, blob, or stream
 * @param {String} mimeType
 * @returns {Promise} {Location: String, ETag: String}
 */
export async function uploadAttachment(fileName, fileData, mimeType) {
  const params = {
    Key: fileName,
    Body: fileData,
    ContentType: mimeType
  };

  return s3.uploadAsync(params);
}

export async function getMetadata(fileName) {
  return s3.headObjectAsync({
    Key: fileName
  });
}

export async function downloadAttachment(fileName) {
  return s3.getObjectAsync({
    Key: fileName
  });
}

export function generateName(fileName) {
  const token = crypto.randomBytes(16).toString('hex');

  return `${config.attachments.prefix}${token}-${fileName}`;
}

export default s3;
