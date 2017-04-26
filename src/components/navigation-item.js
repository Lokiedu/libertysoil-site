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
import { Map as ImmutableMap } from 'immutable';
import omit from 'lodash/omit';

import Icon from './icon';

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

const m = ImmutableMap();

/**
 * Looks like normal navigation item but it isn't a link
 */
const NavigationItemPlain = ({
  children,
  className,
  disabled,
  theme,
  ...props
}) => {
  const cn = classNames('navigation-item', className, {
    'navigation-item--disabled': disabled
  });

  if (theme === '2.0') {
    const { icon, badge, ...htmlProps } = props;

    const finalIcon = icon.update('className', iconClassName =>
      classNames('navigation-item__icon', iconClassName)
    );

    return (
      <div className={cn} {...htmlProps}>
        <div className="navigation-item__content-box">
          <div className="navigation-item__content">
            {children}
          </div>
          {badge &&
            <div className="navigation-item__badge">
              {badge}
            </div>
          }
        </div>
        {icon &&
          <Icon {...finalIcon.toObject()} />
        }
      </div>
    );
  }

  return (
    <div className={cn} {...props}>
      {children}
    </div>
  );
};

NavigationItemPlain.defaultProps = {
  icon: m
};

const NavigationItemAsLink = ({
  activeClassName,
  children,
  className,
  disabled,
  theme,
  to,
  ...props
}) => {
  let onClick;
  if (disabled) {
    onClick = e => e.preventDefault();
  }

  const cn = classNames('navigation-item', className, {
    'navigation-item--disabled': disabled,
  });

  const activeCn = classNames('navigation-item--active', activeClassName);

  if (theme === '2.0') {
    const { icon, badge, ...htmlProps } = props;

    const finalIcon = icon.update('className', iconClassName =>
      classNames('navigation-item__icon', iconClassName)
    );

    return (
      <Link activeClassName={activeCn} className={cn} to={to} onClick={onClick} {...htmlProps}>
        <div className="navigation-item__content-box">
          <div className="navigation-item__content">
            {children}
          </div>
          {badge &&
            <div className="navigation-item__badge">
              {badge}
            </div>
          }
        </div>
        {icon &&
          <Icon {...finalIcon.toObject()} />
        }
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

NavigationItemPlain.defaultProps = {
  icon: m
};

export default NavigationItem;
