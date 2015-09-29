import React from 'react';
import {Link} from 'react-router';

import User from './user';

import {API_HOST} from '../config'

export default class HeaderComponent extends React.Component {

  render() {
    let AuthBlock;
    var classNames = 'header page__header ' + this.props.className;

    if (this.props.is_logged_in) {
      AuthBlock =
          <div className="header__toolbar">
            <div className="header__toolbar_item">
              <User user={this.props.current_user} hideText={true} />
            </div>
            <form className="header__toolbar_item" action={`${API_HOST}/api/v1/logout`} method="post">
              <button type="submit" className="link">Log out</button>
            </form>
          </div>;
    } else {
      AuthBlock =
          <div className="header__toolbar">
            <div className="header__toolbar_item">
              <Link to="/auth" className="header__toolbar_item">Login</Link>
            </div>
          </div>;
    }

    return (
      <div {...this.props} className={classNames}>
        <div className="header__body">
          <div className="header__logo">
            <a href="/" className="logo" title="Liberty Soil"><span className="logo__title">Liberty Soil</span></a>
          </div>
          {AuthBlock}
        </div>
      </div>
    )
  }
}
