/*eslint-env node, mocha */
import ReactShallowRenderer from 'react-test-renderer/shallow';

import { expect, React } from '../../test-helpers/expect-unit';


const SomeComponent = ({ id }) => {
  return (<div id={id}>Some simple content</div>);
};

describe('First test', function () {
  it('should have method render', function () {
    const renderer = ReactShallowRenderer.createRenderer();
    renderer.render(<SomeComponent id={125} />);

    return expect(renderer, 'to have rendered',
      <div id={125}>
        Some simple content
      </div>
    );
  });
});
