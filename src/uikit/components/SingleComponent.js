import React, { PureComponent } from 'react';
import { string, shape } from 'prop-types';
import * as componentList from './common/index';

class SingleComponent extends PureComponent {
  static propTypes = {
    params: shape({
      name: string
    }),
  };

  state = {};

  render() {
    const { params } = this.props;
    const Component = componentList[params.name]; // eslint-disable-line import/namespace
    return Component ? <Component /> : <div>Is not implemented yet</div>;
  }
}

export default SingleComponent;
