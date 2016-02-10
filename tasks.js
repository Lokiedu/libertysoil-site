/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import kueLib from 'kue';

import config from './config';
import { renderVerificationTemplate, renderResetTemplate, renderWelcomeTemplate, renderDailyDigestTemplate } from './src/email-templates/index';
import { sendEmail, scheduleEmail } from './src/utils/email';
import { createDelayedJob } from './src/utils/queue';
import digestData from './src/utils/digestData';

let queue = kueLib.createQueue(config.kue);

queue.on('error', (err) => {
  process.stderr.write(`${err.message}\n`);
});

let email_digest_schedule = config.email_digest_schedule;

for (const interval of Object.keys(email_digest_schedule)) {
  const seconds = email_digest_schedule[interval];
  const job_type = `${interval}-digest`;

  kueLib.Job.rangeByType( job_type, 'delayed', 0, 1, 'desc', ( err, jobs ) => {

    if (jobs.length > 0) {
      return;
    }

    createDelayedJob(job_type, {
      title: `${interval} digest scheduled`
    }, seconds);


  });

}

queue.process('register-user-email', async function(job, done) {
  const { username,
          email,
          hash } = job.data;

  try {
    let html = await renderVerificationTemplate(new Date(), username, email, `http://www.libertysoil.org/api/v1/user/verify/${hash}`);
    await sendEmail('Please confirm email Libertysoil.org', html, job.data.email);
    done();
  } catch (e) {
    done(e);
  }
});

queue.process('reset-password-email', async function(job, done) {
  try {
    let html = await renderResetTemplate(new Date(), job.data.username, job.data.email, `http://www.libertysoil.org/newpassword/${job.data.hash}`);
    await sendEmail('Reset Libertysoil.org Password', html, job.data.email);
    done();
  } catch (e) {
    done(e);
  }
});

queue.process('verify-email', async function(job, done) {
  try {
    const html = await renderWelcomeTemplate(new Date(), job.data.username, job.data.email);
    await sendEmail('Welcome to Libertysoil.org', html, job.data.email);
    done();
  } catch (e) {
    done(e);
  }
});

queue.process('daily-digest', async function(job, done) {
  try {
    const data = await digestData('daily');
    const html = await renderDailyDigestTemplate({posts: data});

    createDelayedJob(job.type, {
      title: `daily digest scheduled`
    }, config.email_digest_schedule.daily);

    done();
  } catch (e) {
    done(e);
  }
});

queue.process('weekly-digest', async function(job, done) {
  try {
    done();
  } catch (e) {
    done(e);
  }
});

queue.process('monthly-digest', async function(job, done) {
  try {
    done();
  } catch (e) {
    done(e);
  }
});

kueLib.app.listen(3000);

process.stdout.write(`Job service started\n`);
