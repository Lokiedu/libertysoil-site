import { promisify } from 'bluebird';
import { isUndefined } from 'lodash';
import Sendgrid from 'sendgrid';


export async function sendEmail(subject, html, to) {
  if (isUndefined(process.env.SENDGRID_KEY)) {
    throw new Error('SENDGRID_KEY env is not set');
  }

  const sendgrid = Sendgrid(process.env.SENDGRID_KEY);
  const sendEmail = promisify(sendgrid.send, { context: sendgrid });

  const message = {
    to,
    from: 'noreply@libertysoil.org',
    subject,
    html,
    replyto: "vlad@lokieducation.org"
  };

  return sendEmail(message);
}
