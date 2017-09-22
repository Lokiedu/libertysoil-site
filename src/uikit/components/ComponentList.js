import React, { PureComponent } from 'react';
import { string, shape } from 'prop-types';
import { Link } from 'react-router';
import * as componentList from './common/index';

/* import Dimensions from 'react-dimensions';
class ListHead extends PureComponent {
  static propTypes = { containerWidth: number };
  state = {};
  render() {
    return (
      <div className="uikit-page-title component__width">
        <h4> Current width: {this.props.containerWidth}px </h4>
      </div>
    );
  }
}
const ComponentListHead = Dimensions()(ListHead); */

const ComponentHeader = ({ name }) => (
  <div className="view-title component__title">
    <h5> {name} </h5>
    <div>
      <Link to={`source/${name}`}> View Source </Link>
      <span>{' | '}</span>
      <Link to={`preview/${name}`}> Preview </Link>
    </div>
  </div>
);

ComponentHeader.propTypes = {
  name: string
};

class ComponentList extends PureComponent {
  static propTypes = {
    params: shape({
      name: string
    }),
  };

  getComponent = (name, key = name) => {
    const Component = componentList[name]; // eslint-disable-line import/namespace
    if (Component) {
      return (
        <div key={key} className="single-component">
          <ComponentHeader name={name} />
          <Component />
        </div>
      );
    }
    return (<div>Is not implemented yet</div>);
  };

  render() {
    const { params } = this.props;
    if (params.name) {
      return this.getComponent(params.name);
    }
    return (
      <div className="component-list">
        <div className="uikit-page-title">
          <h4> Components </h4>
        </div>
        {Object.keys(componentList).sort().map(this.getComponent)}
      </div>
    );
  }
}

export default ComponentList;
