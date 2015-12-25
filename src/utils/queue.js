import kueLib from 'kue';
import config from '../../config';
let queue = kueLib.createQueue(config.kue);

export async function createJob(name, data) {
  let promise = new Promise((resolve, reject) => {
    queue.create(name, data).save(function(error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

  return await promise;
}
