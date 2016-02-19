/*eslint-env node, mocha */
import { expect } from '../../../../test-helpers/expect-unit';
import Checkit from 'checkit';

import { User as UserValidators } from '../../../../src/api/db/validators';

describe('test first', function() {

  it('simple validation test', async function() {
    let attributes = {
      username: 'Abcdefghijklmnopqrstuvwxyz_abcdefghijklmnopqrstuvwxyz', // 49
      password: 'test'
    };
    let checkit = new Checkit(UserValidators.registration);
    try {
      await checkit.run(attributes);
    } catch (err) {

      return expect(err.toJSON(), 'to equal', {
        username: ['The username must not exceed 31 characters long',
                   'Username can contain letters a-z, numbers 0-9, dashes (-), underscores (_), apostrophes (\'), and periods (.)'
                  ],
        password: ['Password is min. 8 characters. Password can only have ascii characters.']
      });
    }
    return expect(true, 'to be ok');
  });
});
