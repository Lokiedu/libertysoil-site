/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017 Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// @flow
import crypto from 'crypto';

import AWS from 'aws-sdk';

import config from '../../config';


AWS.config.setPromisesDependency(Promise);
const s3 = new AWS.S3(config.attachments.s3);

/**
 * Uploads the file to the bucket specified in config.attachments.s3.Bucket.
 * @param {String} fileName
 * @param {*} fileData An arbitrarily sized buffer, blob, or stream
 * @param {String} mimeType
 * @returns {Promise} {Location: String, ETag: String}
 */
export async function uploadAttachment(fileName: string, fileData: Buffer | Uint8Array | Blob | string, mimeType: string) {
  const params = {
    Key: fileName,
    Body: fileData,
    ContentType: mimeType
  };

  return s3.upload(params).promise();
}

export async function getMetadata(fileName: string) {
  return s3.headObject({ Key: fileName }).promise();
}

export async function downloadAttachment(fileName: string) {
  return s3.getObject({ Key: fileName }).promise();
}

export function generateName(fileName: string) {
  const token = crypto.randomBytes(16).toString('hex');

  return `${config.attachments.prefix}${token}-${fileName}`;
}

export default s3;
