import React from 'react';

import User from '../components/current_user';

export default class Sidebar extends React.Component {
  render() {
    return (
      <div className="page__sidebar">
        <User current_user={this.props.current_user} />

        <div className="layout__row">
          <h3 className="head head-sub">Popular tags</h3>
        </div>

        <div className="layout__row">
          <div className="tags">
            <span className="tag">Psychology</span>
            <span className="tag">Gaming</span>
          </div>
        </div>
      </div>
    )
  }
}
