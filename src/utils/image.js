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
import gm from 'gm';

bb.promisifyAll(gm.prototype);

type CropLwipOptions = {
  bottom: number,
  left: number,
  right: number,
  top: number
};

function isCropLwipOptions(params: mixed): boolean %checks {
  return typeof params === 'object' && params !== null
    && 'bottom' in params && typeof params.bottom === 'number'
    && 'left' in params && typeof params.left === 'number'
    && 'right' in params && typeof params.right === 'number'
    && 'top' in params && typeof params.top === 'number';
}

type CropGMOptions = {
  height: number,
  width: number,
  x: number,
  y: number
};

function isCropGMOptions(params: mixed): boolean %checks {
  return typeof params === 'object' && params !== null
    && 'height' in params && typeof params.height === 'number'
    && 'width' in params && typeof params.width === 'number'
    && 'x' in params && typeof params.x === 'number'
    && 'y' in params && typeof params.y === 'number';
}

type ResizeOptions =
  | { height: number, proportional: boolean }
  | { proportional: boolean, width: number }
  | {
    height: number,
    proportional?: boolean,
    width: number
  };

type Transform =
  | {| crop: CropLwipOptions | CropGMOptions |}
  | {| resize: ResizeOptions |};

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

export async function processImage(
  buffer: Buffer, transforms: Array<Transform>
): Promise<Buffer> {
  const image = new gm(buffer);

  for (const transform of transforms) {
    /**
     * Flow v0.56 supports neither
     * ```
     * const type = Object.keys(transform)[0];
     * const params = transform[type];
     *
     * switch (type) {
     *   case 'crop': {
     *     await crop(image, params);
     *     break;
     *   }
     *   case 'resize': {
     *     resize(image, params);
     *     break;
     *   }
     * }
     * ```
     * nor
     * ```
     * switch (Object.keys(transform)[0]) {
     *   case 'crop': {
     *     await crop(image, transform.crop);
     *     break;
     *   }
     *   case 'resize': {
     *     resize(image, transform.resize);
     *     break;
     *   }
     * }
     * ```
     * and even nor
     * ```
     * if ('crop' in transform) {
     *   await crop(image, transform.crop);
     * } else if ('resize' in transform) {
     *   resize(image, transform.resize);
     * }
     * ```
     */
    if (transform.crop) {
      await crop(image, transform.crop);
    } else if (transform.resize) {
      resize(image, transform.resize);
    }
  }

  return await image.toBufferAsync();
}

type Size = {
  height: number,
  width: number
};

function lwipCrop(image: gm, params: CropLwipOptions, size: Size) {
  if (params.left < 0 || params.top < 0 || params.right < 0 || params.bottom < 0) {
    throw new RangeError('crop parameters should be positive');
  }

  if (
    params.left > size.width || params.right > size.width || params.left > params.right ||
    params.top > size.height || params.bottom > size.height || params.top > params.bottom
  ) {
    throw new RangeError('crop parameters should fit within borders of image');
  }

  const nextWidth = params.right - params.left + 1;
  const nextHeight = params.bottom - params.top + 1;
  const x = params.left;
  const y = params.top;

  image.crop(nextWidth, nextHeight, x, y);
}

function gmCrop(image: gm, params: CropGMOptions, size: Size) {
  if (
    params.x + params.width > size.width ||
    params.y + params.height > size.height
  ) {
    throw new RangeError('crop parameters should fit within borders of image');
  }

  image.crop(params.width, params.height, params.x, params.y);
}

async function crop(
  image: gm, params: CropLwipOptions | CropGMOptions
): Promise<void> {
  const size: Size = await image.sizeAsync();

  if (isCropLwipOptions(params)) {
    // $FlowIssue: flow v0.56 doesn't support refinements with structural types
    lwipCrop(image, params, size);
  } else if (isCropGMOptions(params)) {
    // $FlowIssue: the same as above
    gmCrop(image, params, size);
  } else {
    throw new RangeError(
      '"crop" accepts either "left", "top", "right", and "bottom" or "width", "height", "x", and "y" options.'
    );
  }
}

function resize(image: gm, params: ResizeOptions) {
  if (params.width && params.height) {
    const overrideProportions = params.hasOwnProperty('proportional') && params.proportional !== true;
    // $FlowIssue: this refinement doesn't work too
    image.resize(params.width, params.height, overrideProportions && '!');
  } else if (params.width) {
    image.resize(params.width);
  } else if (params.height) {
    image.resize(null, params.height);
  }
}
