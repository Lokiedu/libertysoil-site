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
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { toggleMenu } from '../actions/ui';
import createSelector from '../selectors/createSelector';
import { MENU_ITEMS } from '../consts/mobile-menu';

import ModalComponent from './modal-component';
import NavigationItem from './navigation-item';

class MobileMenu extends React.Component {
  static displayName = 'MobileMenu';

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    if (!this.props.isVisible) {
      return null;
    }

    return (
      <div className="mobile-menu">
        <ModalComponent
          className="mobile-menu__container"
          onHide={this.props.toggleMenu}
        >
          <div className="mobile-menu__row mobile-menu__close">
            <div className="mobile-menu__close-button" onClick={this.props.toggleMenu} />
          </div>
          {MENU_ITEMS.map(item =>
            <NavigationItem
              className={classNames(
                'mobile-menu__row',
                'mobile-menu__item',
                item.className
              )}
              key={item.title}
              icon={item.icon}
              to={item.url()}
              theme="2.0"
            />
          )}
        </ModalComponent>
      </div>
    );
  }
}

const inputSelector = createSelector(
  state => state.getIn(['ui', 'mobileMenuIsVisible']),
  isVisible => ({ isVisible })
);

const outputSelector = dispatch => ({
  toggleMenu: () => dispatch(toggleMenu(false))
});

export default connect(inputSelector, outputSelector)(MobileMenu);
