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

describe('PostValidator', () => {
  it("doesn't allow `text_type` when `type` is not 'story'", async () => {
    const attributes = {
      type: 'short_text',
      text_type: 'html',
      text_source: '123',
    };

    const result = PostValidator.validate(attributes);
    expect(result.error.details, 'to satisfy', [
      { path: 'text_type', type: 'any.unknown' },
    ]);
  });

  it('fails when no attributes are provided', async () => {
    const attributes = {};

    const result = PostValidator.validate(attributes);
    expect(result.error.details, 'to satisfy', [
      { path: 'type', type: 'any.required' },
      { path: 'text_source', type: 'any.required' },
    ]);
  });

  it('fails on invalid attributes', () => {
    const attributes = {
      type: 'invalid',
      text_source: '',
      text_type: 'invalid',
      title: 'A title',
      hashtags: 123,
      schools: 123,
      geotags: 123,
    };

    const result = PostValidator.validate(attributes);
    expect(result.error.details, 'to satisfy', [
      { path: 'type', type: 'any.allowOnly' },
      { path: 'text_source', type: 'any.empty' },
      { path: 'text_type', type: 'any.unknown' },
      { path: 'title', type: 'any.unknown' },
      { path: 'hashtags', type: 'array.base' },
      { path: 'schools', type: 'array.base' },
      { path: 'geotags', type: 'array.base' },
    ]);
  });

  it('succeeds when all attributes are valid', async () => {
    const attributes = {
      type: 'story',
      text_source: '<h1>Test</test>',
      text_type: 'html',
      title: 'A title',
      hashtags: ['One', 'Two'],
      schools: ['One', 'Two'],
      geotags: ['One', 'Two'],
    };

    const result = PostValidator.validate(attributes);
    expect(result.error, 'to be falsy');
  });
});
