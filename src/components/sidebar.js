import React from 'react';

import CurrentUser from './current-user';

export default class Sidebar extends React.Component {
  render() {
    return (
      <div className="page__sidebar">
        <div className="layout__row">
          <CurrentUser user={this.props.current_user} />
        </div>

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
