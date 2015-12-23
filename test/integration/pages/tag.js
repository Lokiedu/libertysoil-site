/* eslint-env node, mocha */
import { TestUtils, unexpected, expect, unexpectedReact, React } from '../../../test-helpers/expect-unit';
import { TagPage } from '../../../src/pages/tag';

describe('TagPage', function () {
  describe('FollowTagButton', function () {
    it('renders "Follow" button when a user doesn\'t follow the tag', function() {
      let user = {
        email: 'test@test.test',
        followed_tags: {}
      };

      let params = {
        tag: 'TestTag1'
      };

      let component = TestUtils.renderIntoDocument(
        <TagPage
          current_user={user}
          params={params}
          posts={[]}
          tag_posts={[]}
          users={[]}
        />
      );

      expect(component, 'to have rendered',
        <button className="button button-green">Follow</button>
      );
    });

    it('renders "Following" button when a user follows the tag', function() {
      let user = {
        email: 'test@test.test',
        followed_tags: {
          TestTag: {
            name: 'TestTag'
          }
        }
      };

      let params = {
        tag: 'TestTag'
      };

      let component = TestUtils.renderIntoDocument(
        <TagPage
          current_user={user}
          is_logged_in
          params={params}
          posts={[]}
          tag_posts={[]}
          users={[]}
        />
      );

      expect(component, 'to have rendered',
        <button className="button button-yellow">Following</button>
      );
    });
  });
});
