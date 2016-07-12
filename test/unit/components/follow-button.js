/*eslint-env node, mocha */
import { shallow } from 'enzyme';

import { TestUtils, unexpected, expect, React } from '../../../test-helpers/expect-unit';
import FollowButton from '../../../src/components/follow-button';


describe('Follow button Test', function() {

  it('is empty for anonym user or when no current_user in props', function() {
    const wrapper = shallow(<FollowButton />);

    return expect(wrapper.equals(null), 'to be true');
  });
});
