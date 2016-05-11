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
import React, { PropTypes } from 'react';

import TabTitle from './tab-title';

export default class TabsBox extends React.Component {
  static displayName = 'TabsBox';

  static propTypes = {
    active: PropTypes.number,
    children: PropTypes.node,
    className: PropTypes.string,
    invert: PropTypes.bool,
    menuClassName: PropTypes.string,
    onClick: PropTypes.func,
    panelClassName: PropTypes.string
  };

  static defaultProps = {
    active: 0,
    onClick: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      active: props.active || 0
    };
  }

  to = (i) => {
    this.setState({ active: i });
  }

  clickHandler = (i) => {
    this.setState({ active: i });
    this.props.onClick(i);
  };

  render() {
    let className = 'tabs';
    if (this.props.className) {
      className += ` ${this.props.className}`;
    }

    if (this.props.invert) {
      className += ' tabs-reverse';
    }

    let panelClassName = 'tabs__panel';
    if (this.props.panelClassName) {
      panelClassName += ` ${this.props.panelClassName}`;
    }
    let menuClassName = 'tabs__menu';
    if (this.props.menuClassName) {
      menuClassName += ` ${this.props.menuClassName}`;
    }

    const titles = React.Children.map(this.props.children, (tab, i) => {
      const children = tab.props.children;
      let titleClassName = '';
      let content;

      React.Children.forEach(children, child => {
        if ((typeof child === 'object') && (child.type.displayName === 'TabBoxTitle')) {
          if (child.props.className) {
            titleClassName += ` ${child.props.className}`;
          }
          if ((this.state.active === i) && (child.props.classNameActive)) {
            titleClassName += ` ${child.props.classNameActive}`;
          }
          content = child.props.children;
          return;
        }
      });

      return (
        <TabTitle className={titleClassName} index={i} key={i} onClick={this.clickHandler}>
          {content}
        </TabTitle>
      );
    });

    const tabs = React.Children.map(this.props.children, (tab, i) => React.cloneElement(tab, {
      key: i,
      active: (this.state.active === i)
    }));

    return (
      <div className={className}>
        <nav className={menuClassName}>
          {titles}
        </nav>
        <div className={panelClassName}>
          {tabs}
        </div>
      </div>
    );
  }
}
