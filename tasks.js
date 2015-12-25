import kueLib from 'kue';
import config from './config';

let queue = kueLib.createQueue(config.kue);

queue.process('reset-password-email', function(job, done){
  console.log(job.data);
  done();
});
