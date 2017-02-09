/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { toggleMenu } from '../actions/ui';

class TopMenu extends React.Component {
  static displayName = 'TopMenu';
  static propTypes = {
    is_logged_in: PropTypes.boolean,
    toggleMenu: PropTypes.func
  };
  static defaultProps = {
    is_logged_in: false,
    toggleMenu: () => {}
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.is_logged_in !== this.props.is_logged_in;
  }

  render() {
    return (
      <div className="top-menu layout layout-align_vertical">
        <div className="mobile-menu__hamburger hamburger" onClick={this.props.toggleMenu}>
          <div className="hamburger__line" />
        </div>
        {!this.props.is_logged_in &&
          <div className="layout__space_left layout__space">
            <span className="font--underlined">Welcome</span> to <span className="font--underlined">Liberty</span>!
            Please <Link className="font--underlined clean-hover" to="/auth#register">register</Link> or <Link className="font--underlined clean-hover" to="/auth">log in</Link>.
          </div>
        }
      </div>
    );
  }
}

const outputSelector = dispatch => ({
  toggleMenu: () => dispatch(toggleMenu(true))
});

export default connect(null, outputSelector)(TopMenu);
