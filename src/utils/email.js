/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017 Loki Education (Social Enterprise)

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
// @flow
import bb from 'bluebird';
import { isUndefined } from 'lodash';
import Sendgrid from 'sendgrid';


export async function sendEmail(
  subject: string, html: string, to: string
): Promise<Object> {
  if (isUndefined(process.env.SENDGRID_KEY)) {
    throw new Error('SENDGRID_KEY env is not set');
  }

  const sendgrid = Sendgrid(process.env.SENDGRID_KEY);
  const sendEmail = bb.promisify(sendgrid.send, { context: sendgrid });

  const message = {
    to,
    from: 'noreply@libertysoil.org',
    subject,
    html,
    replyto: "vlad@lokieducation.org"
  };

  return sendEmail(message);
}
