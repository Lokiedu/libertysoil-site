/*eslint-env node, mocha */
import kueLib from 'kue';
import expect from 'unexpected';


const queue = kueLib.createQueue();

describe('Kue works', function () {
  before(function () {
    queue.testMode.enter();
  });

  afterEach(function () {
    queue.testMode.clear();
  });

  after(function () {
    queue.testMode.exit();
  });

  it('and accepting jobs', function () {
    queue.createJob('myJob', { foo: 'bar' }).save();
    queue.createJob('anotherJob', { baz: 'bip' }).save();
    expect(queue.testMode.jobs.length, 'to equal', 2);
    expect(queue.testMode.jobs[0].type, 'to equal', 'myJob');
    expect(queue.testMode.jobs[0].data, 'to equal', { foo: 'bar' });
  });
});
