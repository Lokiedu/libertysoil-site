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
import { renderVerificationTemplate, renderResetTemplate } from './src/email-templates/index';
import { sendEmail } from './src/utils/email';


let queue = kueLib.createQueue(config.kue);

queue.on('error', (err) => {
  process.stderr.write(`${err.message}\n`);
});

queue.process('register-user-email', async function(job, done) {
  const { username,
          email,
          hash } = job.data;

  try {
    let html = await renderVerificationTemplate(new Date(), username, email, `http://www.libertysoil.org/api/verify/${hash}`);
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

process.stdout.write(`Job service started\n`);
