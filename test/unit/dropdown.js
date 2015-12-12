import dropdown from '../../src/components/dropdown';
import expect from 'unexpected';

describe('First test', function() {

  it('should have method render', function() {
    let c = new dropdown;
    expect(c.render, 'to be a', 'function');
  });

});
