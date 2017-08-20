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
import classNames from 'classnames';
import { Link } from 'react-router';
import omit from 'lodash/omit';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import { OldIcon as Icon } from './icon';

export const ICON_SIZE = { inner: 'ms', outer: 'm' };

const NavigationItem = (props) => {
  if (props.to) {
    return <NavigationItemAsLink {...props} />;
  }

  return <NavigationItemPlain {...omit(props, ['activeClassName'])} />;
};

NavigationItem.displayName = 'NavigationItem';

NavigationItem.propTypes = {
  to: PropTypes.string
};

const ANIMATION_PROPERTIES = {
  className: 'navigation-item__content-wrapper',
  component: 'div',
  transitionName: 'navigation-item--transition',
  transitionEnter: true,
  transitionLeave: true,
  transitionEnterTimeout: 250,
  transitionLeaveTimeout: 250
};

/**
 * Looks like normal navigation item but it isn't a link
 */
const NavigationItemPlain = ({
  animated,
  children,
  className,
  disabled,
  theme,
  truncated,
  ...props
}) => {
  const cn = classNames('navigation-item', {
    'navigation-item--disabled': disabled,
    [`${className}`]: className
  });

  if (theme === '2.0') {
    const { icon, badge, ...htmlProps } = props;

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
      </div>
    );
  }

  return (
    <div className={cn} {...props}>
      {children}
    </div>
  );
};

const NavigationItemAsLink = ({
  activeClassName,
  animated,
  children,
  className,
  disabled,
  theme,
  to,
  truncated,
  ...props
}) => {
  let onClick;
  if (disabled) {
    onClick = e => e.preventDefault();
  }

  const cn = classNames('navigation-item', {
    'navigation-item--disabled': disabled,
    [`${className}`]: className
  });

  const activeCn = classNames('navigation-item--active', {
    [`${activeClassName}`]: activeClassName
  });

  if (theme === '2.0') {
    const { icon, badge, ...htmlProps } = props;

    const finalIcon = {
      round: false,
      size: ICON_SIZE,
      ...icon,
      className: classNames('navigation-item__icon', icon && icon.className)
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
      <Link activeClassName={activeCn} className={cn} to={to} onClick={onClick} {...htmlProps}>
        {contentContainer}
        {icon && <Icon {...finalIcon} />}
      </Link>
    );
  }

  return (
    <Link
      activeClassName={activeCn}
      className={cn}
      to={to}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default NavigationItem;
