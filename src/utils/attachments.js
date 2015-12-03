import AWS from 'aws-sdk';
import bluebird from 'bluebird';
import crypto from 'crypto';

import config from '../../config';

let s3 = bluebird.promisifyAll(new AWS.S3(config.attachments.s3));

/**
 * Uploads the file to the bucket specified in config.attachments.s3.Bucket.
 * @param {String} fileName
 * @param {*} fileData An arbitrarily sized buffer, blob, or stream
 * @returns {Object} {Location: String, ETag: String}
 */
export async function uploadAttachment(fileName, fileData, mimeType) {
  let typeInfo = fileType(fileData);

  let params = {
    Key: fileName,
    Body: fileData,
    ContentType: mimeType
  };

  return await s3.uploadAsync(params);
}

/**
 * Gets object's metadata.
 * @param {String} fileName
 * @returns {Object}
 */
export async function getMetadata(fileName) {
  return await s3.headObjectAsync({
    Key: fileName
  });
}

export function generateName(fileName) {
  let token = crypto.randomBytes(16).toString('hex');

  return `${config.attachments.prefix}${token}-${fileName}`;
}

export default s3;
