/* eslint-env node, mocha */
import { TestUtils, unexpected, expect, unexpectedReact, React } from '../../../test-helpers/expect-unit';
import { SchoolPage } from '../../../src/pages/school';

describe('SchoolPage', function () {
  describe('FollowTagButton', function () {
    it('renders "Follow" button when a user doesn\'t follow the tag', function() {
      let user = {
        email: 'test@test.test',
        followed_schools: {}
      };

      let params = {
        school_name: 'school.com'
      };

      let schools = [
        {id: 1, name: 'school', url_name: 'school.com'}
      ];

      let component = TestUtils.renderIntoDocument(
        <SchoolPage
          current_user={user}
          params={params}
          school_posts={[]}
          schools={schools}
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
        followed_schools: {
          TestSchool: {
            name: 'TestTag',
            url_name: 'school.com'
          }
        }
      };

      let params = {
        school_name: 'school.com'
      };

      let schools = [
        {id: 1, name: 'school', url_name: 'school.com'}
      ];

      let component = TestUtils.renderIntoDocument(
        <SchoolPage
          current_user={user}
          is_logged_in
          params={params}
          school_posts={[]}
          schools={schools}
          users={[]}
        />
      );

      expect(component, 'to have rendered',
        <button className="button button-yellow">Following</button>
      );
    });
  });
});
