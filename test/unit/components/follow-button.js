/*eslint-env node, mocha */
import { shallow } from 'enzyme';
import { v4 as uuid4 } from 'uuid';
import i from 'immutable';

import { expect, React } from '../../../test-helpers/expect-unit';
import FollowButton from '../../../src/components/follow-button';
import userFactory from '../../../test-helpers/factories/user';


describe('Follow button Test', function () {
  const currentUser = userFactory.build();
  currentUser.favourites = [];
  currentUser.geotags = [];
  currentUser.hashtags = [];
  currentUser.schools = [];
  currentUser.suggested_users = [];
  currentUser.followed_geotags = [];
  currentUser.followed_hashtags = [];
  currentUser.followed_schools = [];
  currentUser.liked_geotags = [];
  currentUser.liked_hashtags = [];
  currentUser.liked_schools = [];
  currentUser.likes = [];
  currentUser.recent_tags = {
    geotags: [],
    hashtags: [],
    schools: []
  };

  it('is empty for anonym user or when no current_user in props', function () {
    const wrapper = shallow(<FollowButton />);

    return expect(wrapper.equals(null), 'to be true');
  });

  it('should render "Follow" for unfollowed users', () => {
    const props = {
      active_user: i.fromJS(currentUser),
      following: i.fromJS([uuid4(), uuid4()]),
      user: i.fromJS(userFactory.build())
    };
    const wrapper = shallow(<FollowButton {...props} />);
    return expect(wrapper.text(), 'to be', 'Follow');
  });

  it('should render "Following" for followed users', () => {
    const user = userFactory.build();

    const props = {
      active_user: i.fromJS(currentUser),
      following: i.fromJS([uuid4(), uuid4(), user.id]),
      user: i.fromJS(user)
    };
    const wrapper = shallow(<FollowButton {...props} />);
    return expect(wrapper.text(), 'to be', 'Following');
  });
});
