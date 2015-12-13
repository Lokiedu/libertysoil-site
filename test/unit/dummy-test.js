/*eslint-env node, mocha */
import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';
import TestUtils from 'react-addons-test-utils';
import React, {Component} from 'react';

const expect = unexpected.clone()
    .use(unexpectedReact);

class SomeComponent extends Component {

  render() {
    return (<div id={this.props.id}>Some simple content</div>);
  };

}

// First require your DOM emulation file (see below)
require( './emulateDom.js');

describe('First test', function() {

  it('should have method render', function() {
    let component = TestUtils.renderIntoDocument(<SomeComponent id={125} />);

    return expect(component, 'to have rendered',
       <div id={125}>
          Some simple content
       </div>
    );

  });

});
