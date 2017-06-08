import React from 'react';
import isEqual from 'lodash/isEqual';
import { connect } from 'react-redux';

import createSelector from '../../../selectors/createSelector';
import { transformJSX } from './util';

class ExamplePreview extends React.Component {
  constructor(props, ...args) {
    super(props, ...args);
    this.state = { code: props.code };

    if (typeof window === 'undefined') {
      this.example = { __module: { default: () => {} } };
    } else {
      const docs = window.UIKit.docs[this.props.urlName];
      this.context = docs.context;
      this.example = docs.examples[this.props.index];
      this.execute();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props
      || !isEqual(nextState, this.state);
  }

  execute = () => {
    const compiled = transformJSX(this.state.code, { context: this.context });
    if (this.example.__code === compiled.__code) {
      return;
    }

    this.example.__code = compiled.__code;
    try {
      this.example.__module = eval(compiled.__code);
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    let body;
    const Component = this.example.__module.default;
    if (Component instanceof Function) {
      body = <Component />;
    } else {
      body = Component;
    }

    return (
      <div className="layout">
        {body}
      </div>
    );
    // code editor expected
  }
}

const mapStateToProps = createSelector(
  (state, props) => state.getIn(['kit', 'docs', props.urlName, props.index]),
  code => ({ code })
);

export default connect()(ExamplePreview);
