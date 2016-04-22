import bluebird from 'bluebird';
import lwipOld from 'lwip';
import fileType from 'file-type';

// taken from https://github.com/nkt/node-lwip-promise/blob/master/index.js
let lwip = bluebird.promisifyAll(lwipOld);
bluebird.promisifyAll(require('lwip/lib/Image').prototype);
bluebird.promisifyAll(require('lwip/lib/Batch').prototype);


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
        batch.crop(params.left, params.top, params.right, params.bottom);
        break;
      }
      case 'resize': {
        batch.resize(params.width, params.height);
        break;
      }
      case 'scale': {
        batch.scale(params.wRatio);
        break;
      }
    }
  }

  return batch.execAsync();
}
