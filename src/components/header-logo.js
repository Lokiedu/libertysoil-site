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
import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { Immutable as ImmutablePropType } from '../prop-types/common';
import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import currentUserSelector from '../selectors/currentUser';
import createSelector from '../selectors/createSelector';

class HeaderLogo extends Component {
  static displayName = 'HeaderLogo';

  static propTypes = {
    current_user: ImmutablePropType(CurrentUserPropType)
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const {
      current_user,
      small
    } = this.props;

    const logoBody = (
      <div className={classNames('logo', { 'logo-size_small': small })}>
        <span className="logo__title">Liberty Soil</span>
      </div>
    );

    if (current_user.get('id')) {
      return (
        <div className="header__logo action">
          {logoBody}
        </div>
      );
    }

    return (
      <Link to="/" className="header__logo action">
        {logoBody}
      </Link>
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  current_user => ({
    ...current_user
  })
);

export default connect(selector)(HeaderLogo);
