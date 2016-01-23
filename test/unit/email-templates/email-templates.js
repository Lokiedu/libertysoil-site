/*eslint-env node, mocha */
import { unexpected as expect } from '../../../test-helpers/expect-unit';
import { renderVerificationTemplate, renderWelcomeTemplate }  from '../../../src/email-templates/index';


describe('Email templates:', function() {

  it('Verification template exist', async function() {
    const template = await renderVerificationTemplate(new Date());

    expect(template, 'to be a string');
  });

  it('Welcome template exist', async function() {
    const template = await renderWelcomeTemplate(new Date());

    expect(template, 'to be a string');
  });

});
