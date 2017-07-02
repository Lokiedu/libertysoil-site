/* eslint-env node, mocha */
import { expect } from '../../../test-helpers/expect-unit';
import { UserRegistrationValidator, PostValidator } from '../../../src/api/validators';


describe('UserRegistrationValidator', () => {
  it('fails when invalid attributes are provided', async () => {
    const attributes = {
      username: '#abcdefghijklmnopqrstuvwxyz_abcdefghijklmnopqrstuvwxyz', // 49
      password: 'test',
      email: 'test',
      firstName: 'test',
      lastName: 'test',
    };

    const result = UserRegistrationValidator.validate(attributes);
    expect(result.error.details, 'to satisfy', [
      { path: 'username', type: 'string.max' },
      { path: 'password', type: 'string.min' },
      { path: 'email', type: 'string.email' },
    ]);
  });

  it('fails when no attributes are provided', async () => {
    const attributes = {};
    const result = UserRegistrationValidator.validate(attributes);

    expect(result.error.details, 'to satisfy', [
      { path: 'username', type: 'any.required' },
      { path: 'password', type: 'any.required' },
      { path: 'email', type: 'any.required' },
    ]);
  });

  it('succeeds when all attributes are valid', async () => {
    const attributes = {
      username: 'test', // 49
      password: 'testtest',
      email: 'test@example.com',
      firstName: 'test',
      lastName: 'test',
    };

    const result = UserRegistrationValidator.validate(attributes);
    expect(result, 'to satisfy', {
      error: expect.it('to be falsy')
    });
  });
});
