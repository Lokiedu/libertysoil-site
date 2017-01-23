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

import { CurrentUser as CurrentUserPropType } from '../prop-types/users';

import AuthBlock from './auth-block';
import HeaderLogo from './header-logo';
import Search from './search';
import TopMenu from './top-menu';

const HeaderComponent = ({
  children,
  className,
  current_user,
  is_logged_in,
  needMenu,
  ...props
}) => {
  let cn = 'header page__header';
  if (className) {
    cn += ` ${className}`;
  }

  return (
    <div>
      <div {...props} className={cn}>
        <div className="header__body">
          <div className="header__content">
            {!React.Children.count(children) &&
              <HeaderLogo small />
            }
            {children}
          </div>
          <div className="header__toolbar">
            <div className="header__toolbar_item header__toolbar_item-right_space">
              <Search />
            </div>
            <AuthBlock current_user={current_user} is_logged_in={is_logged_in} />
          </div>
        </div>
      </div>
      {needMenu &&
        <TopMenu is_logged_in={is_logged_in} />
      }
    </div>
  );
};

HeaderComponent.displayName = 'HeaderComponent';

HeaderComponent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  current_user: CurrentUserPropType,
  is_logged_in: PropTypes.bool.isRequired
};

HeaderComponent.defaultProps = {
  needMenu: true
};

export default HeaderComponent;
