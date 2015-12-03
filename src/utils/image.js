import bluebird from 'bluebird';
import lwipOld from 'lwip';
import fileType from 'file-type';

let lwip = bluebird.promisifyAll(lwipOld);


/**
 * Applies transforms to the image.
 * Available transforms (add as needed):
 *   {crop: {left: Number, top: Number, right: Number, bottom: Number}}
 *   {resize: {width: Number, height: Number}}
 * @param {Buffer} buffer
 * @param {Array} transforms - An array of transforms
 * @returns {Image}
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
    }
  }

  // It doesn't work with bluebird for some reason.
  return new Promise((resolve, reject) => {
    batch.exec(function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  });
}
