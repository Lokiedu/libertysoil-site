import kueLib from 'kue';
import config from './config';
import { renderWelcomeTemplate, renderResetTemplate } from './src/email-templates/index';
import { sendEmail } from './src/utils/email';

let queue = kueLib.createQueue(config.kue);

queue.process('register-user-email', async function(job, done) {
  const { username,
        email,
        hash } = job.data;
  let html = await renderWelcomeTemplate(new Date(), username, email, `http://www.libertysoil.org/api/verify/${hash}`);
  await sendEmail('Welcome to Libertysoil.org', html, job.data.email);
  done();
});

queue.process('reset-password-email', async function(job, done) {
  let html = await renderResetTemplate(new Date(), job.data.username, job.data.email, `http://www.libertysoil.org/newpassword/${job.data.hash}`);
  await sendEmail('Reset Libertysoil.org Password', html, job.data.email);
  done();
});

console.log('Job service started');
