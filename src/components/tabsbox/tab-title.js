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

import TabTitleLink from './tab-title-link';

function is(elem, type) {
  return (React.isValidElement(elem) && (elem.type.displayName === type));
}

class TabBoxTitle extends React.Component {
  static displayName = 'TabBoxTitle';

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    index: PropTypes.number,
    onClick: PropTypes.func
  };

  clickHandler = () => {
    const { index, onClick } = this.props;

    onClick(index);
  };

  hasLinksInside() {
    const children = React.Children.toArray(this.props.children);

    for (let i = 0; i < children.length; ++i) {
      if (is(children[i], 'TabTitleLink')) {
        return true;
      }
    }

    return false;
  }

  linkifyChildren() {
    let className;
    if (this.props.className) {
      className = this.props.className;
    }

    return React.Children.map(this.props.children, (child, i) => {
      if (is(child, 'TabBoxTitleLink')) {
        return React.cloneElement(child, {
          key: i,
          className: className,
          onClick: this.clickHandler
        });
      }

      return child;
    });
  }

  render() {
    const { className, children } = this.props;

    let cn = 'tabs__title';
    if (className) {
      cn += ` ${className}`;
    }

    // whole TabTile content isn't the link to TabContent
    if (this.hasLinksInside()) {
      return (
        <span className='tabs__title'>
          {this.linkifyChildren()}
        </span>
      );
    }

    // whole TabTitle is a link
    cn += ' tabs__link';
    return <span className={cn} onClick={this.clickHandler}>{children}</span>;
  }
}

TabBoxTitle.Link = TabTitleLink;

export default TabBoxTitle;
