import React from 'react';
import {Link} from 'react-router';

import User from './user';

export default class HeaderComponent extends React.Component {
  render() {
    let AuthBlock;
    var classNames = 'header page__header ' + this.props.className;

    if (this.props.is_logged_in) {
      AuthBlock = <div className="header__toolbar_item"><User user={this.props.current_user} /></div>
    } else {
      AuthBlock = <Link to="/auth" className="header__toolbar_item">Login</Link>
    }

    return (
      <div {...this.props} className={classNames}>
        <div className="header__body">
          <div className="header__logo">
            <a href="/" className="logo" title="Liberty Soil"><span className="logo__title">Liberty Soil</span></a>
          </div>
          <div className="header__toolbar">
            {AuthBlock}
          </div>
        </div>
      </div>
    )
  }
}
