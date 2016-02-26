/*eslint-env node, mocha */
import { expect } from '../../../test-helpers/expect-unit';
import QueueSingleton from '../../../src/utils/queue';


describe('Queue test', function() {

  beforeEach( () => {
    this.queue = new QueueSingleton;
    this.queue.setHandler('ccc'); // just a dummy value to test singleton
  });

  it('Singleton should work', function() {
    let c = new QueueSingleton;

    return expect(c.handler, 'to equal', 'ccc');
  });

});
