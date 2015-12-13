/*eslint-env node, mocha */
import expect from 'unexpected';

import dropdown from '../../src/components/dropdown';


describe('First test', function() {
  it('should have method render', function() {
    let c = new dropdown;
    expect(c.render, 'to be a', 'function');
  });
});
