import React from 'react';
import {Link} from 'react-router';

export default class HeaderComponent extends React.Component {
  render() {
    return (
      <div className="header page__header">
        <div className="header__body">
          <div className="header__logo">
            <a href="/" className="logo">Liberty Soil</a>
          </div>
          <div className="header__toolbar">
            <div className="header__toolbar_item user">{this.props.currentUser.username}</div>
            <Link to="/auth" className="header__toolbar_item">auth</Link>
          </div>
        </div>
      </div>
    )
  }
}
