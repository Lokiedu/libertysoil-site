/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import PropTypes from 'prop-types';

import React from 'react';
import { connect } from 'react-redux';

import createSelector from '../selectors/createSelector';
import Logo from './logo';

class HeaderLogo extends React.Component {
  static displayName = 'HeaderLogo';

  static propTypes = {
    isLink: PropTypes.bool,
    is_logged_in: PropTypes.bool.isRequired
  };

  static defaultProps = {
    isLink: true
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    return (
      <Logo
        className="header__block header__logo header__corner action"
        isLink={this.props.isLink}
      />
    );
  }
}

const selector = createSelector(
  state => !!state.getIn(['current_user', 'id']),
  is_logged_in => ({ is_logged_in })
);

export default connect(selector)(HeaderLogo);
