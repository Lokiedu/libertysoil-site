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
import bb from 'bluebird';
import { pick, isEqual } from 'lodash';
import gm from 'gm';

bb.promisifyAll(gm.prototype);


/**
 * Applies transforms to the image.
 * Available transforms:
 *   {crop: {left: Number, top: Number, right: Number, bottom: Number}}
 *      For compatibility with the old code. The "lwip way" of doing crop.
 *      "right" - distance from the left side of the image.
 *      "bottom" - distance from the top side of the image.
 *   {crop: {width: Number, height: Number, x: Number, y: Number}}
 *   {resize: {width: Number, height: Number, proportional: boolean}}
 *      "proportional" = true by default
 * @param {Buffer} buffer
 * @param {Array} transforms An array of transforms
 * @returns {Promise<Buffer>}
 */
export async function processImage(buffer: Buffer, transforms: Array<Object>): Promise<Buffer> {
  const image = new gm(buffer);

  for (const transform of transforms) {
    const type = Object.keys(transform)[0];
    const params = transform[type];

    switch (type) {
      case 'crop': {
        await crop(image, params);
        break;
      }
      case 'resize': {
        resize(image, params);
        break;
      }
    }
  }

  return await image.toBufferAsync();
}

async function crop(image, params): Promise<void> {
  const size = await image.sizeAsync();
  const w = size.width;
  const h = size.height;
  const cropKeys = ['left', 'top', 'right', 'bottom'];
  const cropKeysAlt = ['width', 'height', 'x', 'y'];
  const cropParams = pick(params, cropKeys, cropKeysAlt);

  if (isEqual(Object.keys(cropParams), cropKeys)) {
    if (cropParams.left < 0 || cropParams.top < 0 || cropParams.right < 0 || cropParams.bottom < 0) {
      throw new RangeError('crop parameters should be positive');
    }

    if (
      cropParams.left > w || cropParams.right > w || cropParams.left > cropParams.right ||
      cropParams.top > h || cropParams.bottom > h || cropParams.top > cropParams.bottom
    ) {
      throw new RangeError('crop parameters should fit within borders of image');
    }

    const width = cropParams.right - cropParams.left + 1;
    const height = cropParams.bottom - cropParams.top + 1;
    const x = cropParams.left;
    const y = cropParams.top;

    image.crop(width, height, x, y);
  } else if (isEqual(Object.keys(cropParams), cropKeysAlt)) {
    if (
      cropParams.x + cropParams.width > w ||
      cropParams.y + cropParams.height > h
    ) {
      throw new RangeError('crop parameters should fit within borders of image');
    }

    image.crop(cropParams.width, cropParams.height, cropParams.x, cropParams.y);
  } else {
    throw new RangeError(
      '"crop" accepts either "left", "top", "right", and "bottom" or "width", "height", "x", and "y" options.'
    );
  }
}

function resize(image, params) {
  if (params.width && params.height) {
    const overrideProportions = params.hasOwnProperty('proportional') && params.proportional !== true;
    image.resize(params.width, params.height, overrideProportions && '!');
  } else if (params.width) {
    image.resize(params.width);
  } else if (params.height) {
    image.resize(null, params.height);
  }
}
