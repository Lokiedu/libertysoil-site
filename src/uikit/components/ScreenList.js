import React, { PureComponent } from 'react';
import { string, shape } from 'prop-types';

// import * as screenList from './fullPages/index';


const screenList = {};
export const listofScreens = Object.keys(screenList).sort();

class ScreenList extends PureComponent {
  static propTypes = {
    className: string,
    params: shape({
      name: string
    }),
  };

  defaultProps = {
    className: "",
  };

  getFullPage = (name, key = name) => {
    const Component = screenList[name]; // eslint-disable-line import/namespace

    if (Component) {
      return (
        <div key={key}>
          <div className="view-title">
            <h5> {name} </h5>
          </div>
          <div className="screen_wrapper">
            <Component />
          </div>
        </div>
      );
    }
    return (<div>Is not implemented yet</div>);
  };

  render() {
    const { className, params } = this.props;
    if (params.name) {
      return this.getFullPage(params.name);
    }
    return (
      <div className={className} style={{ marginBottom: '100px' }}>
        <div className="uikit-page-title">
          <h4> Full-pages </h4>
        </div>
        {listofScreens.map(this.getFullPage)}
      </div>
    );
  }
}

export default ScreenList;
