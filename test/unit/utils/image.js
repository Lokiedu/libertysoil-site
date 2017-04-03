/*eslint-env node, mocha */
import fs from 'fs';
import { promisifyAll } from 'bluebird';
import gm from 'gm';
import { expect } from '../../../test-helpers/expect-unit';
import { processImage } from '../../../src/utils/image';


promisifyAll(gm.prototype);

describe('processImage', () => {
  it('works well with sample image', async () => {
    /**
     image sample https://commons.wikimedia.org/wiki/File:Simple_light_bulb_graphic.png
     with a free license.
    */
    const buffer = fs.readFileSync('test-helpers/bulb.png');
    let image, size;

    // cropping
    image = await processImage(buffer, [{ crop: { left: 0, top: 0, right: 4, bottom: 9 } }]);
    size = await gm(image).sizeAsync();
    expect(size, 'to satisfy', { width: 5, height: 10 });

    image = await processImage(buffer, [{ crop: { x: 2, y: 3, width: 5, height: 10 } }]);
    size = await gm(image).sizeAsync();
    expect(size, 'to satisfy', { width: 5, height: 10 });

    // resizing
    image = await processImage(buffer, [{ resize: { width: 50, height: 100 } }]);
    size = await gm(image).sizeAsync();
    expect(size, 'to satisfy', { width: 50, height: 50 });

    image = await processImage(buffer, [{ resize: { width: 50, height: 100, proportional: false } }]);
    size = await gm(image).sizeAsync();
    expect(size, 'to satisfy', { width: 50, height: 100 });
  });
});
