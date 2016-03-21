import bluebird from 'bluebird';
import lwipOld from 'lwip';
import fileType from 'file-type';

// taken from https://github.com/nkt/node-lwip-promise/blob/master/index.js
let lwip = bluebird.promisifyAll(lwipOld);
bluebird.promisifyAll(require('lwip/lib/Image').prototype);
bluebird.promisifyAll(require('lwip/lib/Batch').prototype);


/**
 * Applies transforms to the image.
 * See: https://github.com/EyalAr/lwip
 * Available transforms (add in as needed):
 *   {crop: {left: Number, top: Number, right: Number, bottom: Number}} - Rectangle with coordinates from the top left corner.
 *   {crop: {width: Number, height: Number}} - A rectangle at the center of the image.
 *   {crop: {size: Number}} - A square at the center of the image.
 *   {resize: {width: Number, height: Number}}
 * @param {Buffer} buffer
 * @param {Array} transforms - An array of transforms.
 * @returns {Promise<Image>}
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
        let { left, top, right, bottom, width, height, size } = params;

        if (size) {
          batch.crop(size);
        } else if (width && height) {
          batch.crop(width, height);
        } else {
          batch.crop(left, top, right, bottom);
        }

        break;
      }
      case 'resize': {
        batch.resize(params.width, params.height);
        break;
      }
    }
  }

  return batch.execAsync();
}
