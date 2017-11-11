/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import classNames from 'classnames';
import React from 'react';

import { OldIcon as Icon } from '../icon';
import Switch from './switch';
import { ICON_SIZE, ANIMATION_PROPERTIES } from './common';

/**
 * Looks like normal navigation item but it isn't a link
 */
export default function NavigationItemPlain({
  animated,
  children,
  className,
  disabled,
  theme,
  truncated,
  ...props
}) {
  const cn = classNames('navigation-item', {
    'navigation-item--disabled': disabled,
    [`${className}`]: className
  });

  if (theme === '2.0') {
    const { icon, badge, onSwitchClick, ...htmlProps } = props;

    const finalIcon = {
      size: ICON_SIZE,
      ...icon,
      className: classNames('navigation-item__icon', {
        [icon && icon.className]: icon && icon.className
      })
    };

    const content = (
      <div className="navigation-item__content-box" key="content">
        <div className="navigation-item__content">
          {children}
        </div>
        {badge &&
          <div className="navigation-item__badge" key="badge">
            {badge}
          </div>
        }
      </div>
    );

    let contentContainer;
    if (animated) {
      contentContainer = (
        <CSSTransitionGroup {...ANIMATION_PROPERTIES}>
          {truncated ? null : content}
        </CSSTransitionGroup>
      );
    } else if (!truncated) {
      contentContainer = content;
    } else {
      contentContainer = null;
    }

    return (
      <div className={cn} {...htmlProps}>
        {contentContainer}
        {icon && <Icon {...finalIcon} />}
        {onSwitchClick && <Switch truncated={truncated} onClick={onSwitchClick} />}
      </div>
    );
  }

  return (
    <div className={cn} {...props}>
      {children}
    </div>
  );
}

NavigationItemPlain.defaultProps = {
  theme: '2.0'
};
