/*eslint-env node, mocha */
//import sinon from 'sinon';

import expect from '../../test-helpers/expect';
import { createUser } from '../../test-helpers/factories/user';

describe('pages that are available for anonym', function () {
  // before(() => {
  //   sinon.stub(console, 'error', (warning) => { throw new Error(warning); });
  // });

  // after(() => {
  //   console.error.restore();
  // });


  describe('when user is not logged in', function () {
    let user;
    beforeEach(async function () {
      user = await createUser();
    });

    afterEach(async function () {
      await user.destroy();
    });

    it('User profile page works', async function () {
      await expect(`/user/${user.get('username')}`, 'body to contain', user.fullName);
    });
  });
});
