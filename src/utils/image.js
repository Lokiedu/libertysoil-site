import { promisifyAll } from 'bluebird';
import fileType from 'file-type';
import lwipOld from 'lwip';
import { pick } from 'lodash';

// taken from https://github.com/nkt/node-lwip-promise/blob/master/index.js
const lwip = promisifyAll(lwipOld);
promisifyAll(require('lwip/lib/Image').prototype);
promisifyAll(require('lwip/lib/Batch').prototype);


/**
 * Applies transforms to the image.
 * Available transforms (add as needed):
 *   {crop: {left: Number, top: Number, right: Number, bottom: Number}}
 *   {resize: {width: Number, height: Number}}
 *   {scale: {hRatio: Number, wRatio: Number}}
 * @param {Buffer} buffer
 * @param {Array} transforms - An array of transforms
 * @returns {Promise}
 */
export async function processImage(buffer, transforms) {
  const imageType = fileType(buffer).ext;

  const image = await lwip.openAsync(buffer, imageType);
  const batch = image.batch();

  for (const transform of transforms) {
    const type = Object.keys(transform)[0];
    const params = transform[type];

    switch (type) {
      case 'crop': {
        const cropParams = pick(params, ['left', 'top', 'right', 'bottom']);

        if (Object.keys(cropParams).length !== Object.keys(params).length) {
          throw new RangeError('"crop" accepts only "left", "top", "right" and "bottom" options');
        }

        if (cropParams.left < 0 || cropParams.top < 0 || cropParams.right < 0 || cropParams.bottom < 0) {
          throw new RangeError('crop parameters should be positive');
        }

        const w = image.width();
        const h = image.height();

        if (
          cropParams.left > w || cropParams.right > w || cropParams.left > cropParams.right ||
          cropParams.top > h || cropParams.bottom > h || cropParams.top > cropParams.bottom
        ) {
          throw new RangeError('crop parameters should fit within borders of image');
        }

        batch.crop(cropParams.left, cropParams.top, cropParams.right, cropParams.bottom);
        break;
      }
      case 'resize': {
        if (params.height) {
          batch.resize(params.width, params.height);
        } else {
          batch.resize(params.width);
        }
        break;
      }
      case 'scale': {
        if (params.hRatio) {
          batch.scale(params.wRatio, params.hRatio);
        } else {
          batch.scale(params.wRatio);
        }
        break;
      }
    }
  }

  return batch.execAsync();
}
