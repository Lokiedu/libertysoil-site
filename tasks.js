import kueLib from 'kue';
import config from './config';
import { renderWelcomeTemplate, renderResetTemplate } from './src/email-templates/index';
import { sendEmail } from './src/utils/email';

let queue = kueLib.createQueue(config.kue);

queue.process('reset-password-email', async function(job, done) {
  let html = await renderResetTemplate(new Date(), job.data.username, job.data.email, `http://www.libertysoil.org/newpassword/${job.data.hash}`);
  await sendEmail('Reset Libertysoil.org Password', html, job.data.email);
  done();
});

// queue.process('reset-password-email', async function(job, done){
//   let html = await renderResetTemplate(new Date(), job.data.username, job.data.email, `http://www.libertysoil.org/newpassword/${job.data.hash}`);
//   await sendEmail('Reset Libertysoil.org Password', html, job.data.email);
//   done();
// });
