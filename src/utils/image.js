import { promisifyAll } from 'bluebird';
import fileType from 'file-type';
import lwipOld from 'lwip';

// taken from https://github.com/nkt/node-lwip-promise/blob/master/index.js
const lwip = promisifyAll(lwipOld);
promisifyAll(require('lwip/lib/Image').prototype);
promisifyAll(require('lwip/lib/Batch').prototype);


/**
 * Applies transforms to the image.
 * Available transforms (add as needed):
 *   {crop: {left: Number, top: Number, right: Number, bottom: Number}}
 *   {resize: {width: Number, height: Number}}
 * @param {Buffer} buffer
 * @param {Array} transforms - An array of transforms
 * @returns {Promise}
 */
export async function processImage(buffer, transforms) {
  let imageType = fileType(buffer).ext;

  let image = await lwip.openAsync(buffer, imageType);
  let batch = image.batch();

  for (let transform of transforms) {
    let type = Object.keys(transform)[0];
    let params = transform[type];

    switch (type) {
      case 'crop': {
        if (params.left < 0 || params.top < 0 || params.right < 0 || params.bottom < 0) {
          throw new RangeError('crop parameters should be positive');
        }

        const w = image.width();
        const h = image.height();

        if (
          params.left > w || params.right > w || params.left > params.right ||
          params.top > h || params.bottom > h || params.top > params.bottom
        ) {
          throw new RangeError('crop parameters should fit within borders of image');
        }

        batch.crop(params.left, params.top, params.right, params.bottom);
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
