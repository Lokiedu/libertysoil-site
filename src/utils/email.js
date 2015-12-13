import Promise from 'bluebird';
import { isUndefined } from 'lodash';
import { Mandrill } from 'mandrill-api/mandrill';


export async function sendEmail(subject, html, to) {
  if (isUndefined(process.env.MANDRILL_KEY)) {
    throw new Error('MANDRILL_KEY env is not set');
  }

  let mandrillClient = new Mandrill(process.env.MANDRILL_KEY);

  let message = {
    subject,
    html,
    from_email: 'noreply@libertysoil.org',
    to: [{ email: to, type: 'to' }],
    headers: {
      "Reply-To": "vlad@lokieducation.org"
    },
    auto_text: true
  };

  let promise = new Promise((resolve, reject) => {
    mandrillClient.messages.send({message}, resolve, reject);
  });

  return await promise;
}
