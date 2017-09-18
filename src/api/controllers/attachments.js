/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import config from '../../../config';
import { processImage as processImageUtil } from '../../utils/image';

/**
 * Creates attachments from 'files'.
 * Important: set the 'name' property of each file input to 'files', not 'files[]' or 'files[0]'
 */
export async function uploadFiles(ctx) {
  if (!ctx.req.files || !ctx.req.files.length) {
    ctx.status = 400;
    ctx.body = { error: 'api.errors.validation', fields: [{ path: 'files' }] };
    return;
  }

  const Attachment = ctx.bookshelf.model('Attachment');

  const promises = ctx.req.files.map(file => {
    return Attachment.create(
      file.originalname,
      file.buffer,
      { user_id: ctx.state.user }
    );
  });

  const attachments = await Promise.all(promises);

  ctx.body = { success: true, attachments };
}

/**
 * Loads the image from s3, transforms it and creates a new attachment with the new image
 * if derived_id is not specified.
 * If derived_id is specified then updates the attachment and responds with it.
 * Body params:
 *   original_id (required) - Id of the original attachment.
 *   transforms (required) - Json array with transforms. See utils/image.js processImage
 *   derived_id - Id of the attachment to reuse
 */
export async function processImage(ctx) {
  if (!ctx.request.body.original_id) {
    ctx.status = 400;
    ctx.body = { error: '"original_id" parameter is not provided' };
    return;
  }

  if (!ctx.request.body.transforms) {
    ctx.status = 400;
    ctx.body = { error: '"transforms" parameter is not provided' };
    return;
  }

  const Attachment = ctx.bookshelf.model('Attachment');

  let result;
  const transforms = JSON.parse(ctx.request.body.transforms);

  // Get the original attachment, checking ownership.
  const original = await Attachment
    .forge()
    .query(qb => {
      qb
        .where('id', ctx.request.body.original_id)
        .andWhere('user_id', ctx.state.user);
    })
    .fetch({ require: true });

  // Check if the format of the attachment is supported.
  const { supportedImageFormats } = config.attachments;
  if (supportedImageFormats.indexOf(original.attributes.mime_type) < 0) {
    ctx.status = 400;
    ctx.body = { error: 'Image type is not supported' };
    return;
  }

  // Download the original attachment data from s3.
  const originalData = await original.download();

  // Process the data.
  const imageBuffer = await processImageUtil(originalData.Body, transforms);

  // Update the attachment specified in derived_id or create a new one.
  if (ctx.request.body.derived_id) {
    const oldAttachment = await Attachment
      .forge()
      .query(qb => {
        qb
          .where('id', ctx.request.body.derived_id)
          .andWhere('user_id', ctx.state.user);
      })
      .fetch({ require: true });

    result = await oldAttachment.reupload(oldAttachment.attributes.filename, imageBuffer);
  } else {
    result = await Attachment.create(
      original.attributes.filename,
      imageBuffer,
      {
        user_id: original.attributes.user_id,
        original_id: original.id
      }
    );
  }

  ctx.body = { success: true, attachment: result };
}
