import Promise from 'bluebird';
import { Mandrill } from 'mandrill-api/mandrill';


export function sendEmail(subject, html, to) {
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

  return new Promise((resolve, reject) => {
    mandrillClient.messages.send({message}, resolve, reject);
  });
}
