/*eslint-env node, mocha */
import { TestUtils, unexpected, expect, React } from '../../../test-helpers/expect-unit';
import FollowButton from '../../../src/components/follow-button';


describe('Follow button Test', function() {

  it('is empty for anonym user or when no current_user in props', function() {
    let renderer = TestUtils.createRenderer();
    renderer.render(<FollowButton />);

    return expect(renderer, 'to have rendered',
                  <script></script>
    );
  });
});
