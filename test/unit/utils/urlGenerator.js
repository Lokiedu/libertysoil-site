/*eslint-env node, mocha */
import { expect } from '../../../test-helpers/expect-unit';
import { getApiUrl } from '../../../src/utils/urlGenerator';

describe('urlGenerator', () => {

  it('Should work well ', () => {

    expect(getApiUrl('USERS'), 'to equal', 'http://localhost:8001/api/v1/users');
  });
});
