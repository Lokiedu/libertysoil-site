/*eslint-env node, mocha */
import fs from 'fs';
import { expect } from '../../../test-helpers/expect-unit';
import { processImage } from '../../../src/utils/image';

describe('processImage', () => {

  it('Should work well with sample image', async () => {
    /**
     image sample https://commons.wikimedia.org/wiki/File:Simple_light_bulb_graphic.png
     with a free license.
    */
    let buffer = fs.readFileSync('test-helpers/bulb.png');
    let image;
    // cropping
    image = await processImage(buffer, [{crop: {left: 0, top: 0, right: 4, bottom:9}}]);

    expect(image.width(), 'to equal', 5);
    expect(image.height(), 'to equal', 10);

    // resizing
    image = await processImage(buffer, [{resize: {height: 100, width: 50}}]);

    expect(image.width(), 'to equal', 50);
    expect(image.height(), 'to equal', 100);

    // scaling
    image = await processImage(buffer, [{scale: {hRatio: 2, wRatio: 2}}]);

    expect(image.width(), 'to equal', 200);
    expect(image.height(), 'to equal', 200);
  });
});
