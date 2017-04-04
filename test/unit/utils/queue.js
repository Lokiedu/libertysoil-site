/*eslint-env node, mocha */
import { expect } from '../../../test-helpers/expect-unit';
import QueueSingleton from '../../../src/utils/queue';


describe('Queue test', function () {
  let queue;

  before(() => {
    queue = new QueueSingleton().handler;
    queue.testMode.enter();
  });

  it('Singleton should work', function () {
    const c = new QueueSingleton;

    // prove global scope queue has no jobs
    expect(queue.testMode.jobs.length, 'to equal', 0);

    // create new job using local scope queue
    c.handler.createJob('myJob', { foo: 'bar' }).save();

    // prove global scope queue now has new job
    expect(queue.testMode.jobs.length, 'to equal', 1);
    expect(queue.testMode.jobs[0].type, 'to equal', 'myJob');
    return expect(queue.testMode.jobs[0].data, 'to equal', { foo: 'bar' });
  });

  afterEach(() => {
    queue.testMode.clear();
  });

  after(() => {
    queue.testMode.exit();
  });
});
