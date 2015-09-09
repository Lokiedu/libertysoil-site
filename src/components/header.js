import React from 'react';
import {Link} from 'react-router';

export default class HeaderComponent extends React.Component {
  render() {
    let AuthBlock;

    if (this.props.is_logged_in) {
      AuthBlock = <div className="header__toolbar_item user">{this.props.current_user.username}</div>
    } else {
      AuthBlock = <Link to="/auth" className="header__toolbar_item">auth</Link>
    }

    return (
      <div className="header page__header">
        <div className="header__body">
          <div className="header__logo">
            <a href="/" className="logo">Liberty Soil</a>
          </div>
          <div className="header__toolbar">
            {AuthBlock}
          </div>
        </div>
      </div>
    )
  }
}
