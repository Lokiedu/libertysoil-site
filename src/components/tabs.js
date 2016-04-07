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
import React, { Component, PropTypes } from 'react';

export class TabTitle extends Component {
  static displayName = 'TabTitle';

  render() {
    let className = 'tabs__title';
    if (this.props.className) {
      className += ' ' + this.props.className;
    }
    return <li onClick={this.props.onClick} className={className}>{this.props.children}</li>;
  }
}

export class TabContent extends Component {
  static displayName = 'TabContent';

  render() {
    return <div className={this.props.className}>{this.props.children}</div>;
  }
}

export class Tab extends Component {
  static displayName = 'Tab';

  render() {
    let className = 'tabs__tab';
    if (this.props.className) {
      className += ' ' + this.props.className;
    }
    if (!this.props.active) {
      className += ' hidden';
    }

    let content;
    React.Children.forEach(this.props.children, child => {
      if ((typeof child === 'object') && (child.type.displayName === 'TabContent')) {
        content = child;
      }
    })

    return (
      <div className={className}>{content}</div>
    );
  }
}

export class Tabs extends Component {
  static displayName = 'Tabs';
  static propTypes = {
    onActiveChanged: PropTypes.func,
    active: PropTypes.number,
    invert: PropTypes.bool,
    className: PropTypes.string,
    menuClassName: PropTypes.string,
    panelClassName: PropTypes.string
  };

  state = {
    active: this.props.active
  };

  static defaultProps = {
    active: 0,
    onActiveChanged: () => {}
  };

  componentWillReceiveProps(nextProps) {
    if ((typeof nextProps.active === 'number') && (nextProps.active !== this.state.active)) {
      this.setState({ active: nextProps.active });
    }
  }
  
  clickHandler = (i) => {
    this.setState({ active: i });
    this.props.onActiveChanged(i);
  };

  render() {
    let className = 'tabs';
    if (this.props.className) {
      className += ' ' + this.props.className;
    }

    let panelClassName = 'tabs__panel';
    if (this.props.panelClassName) {
      panelClassName += ' ' + this.props.panelClassName;
    }
    let menuClassName = 'tabs__menu';
    if (this.props.menuClassName) {
      menuClassName += ' ' + this.props.menuClassName;
    }

    const titles = React.Children.map(this.props.children, (item, i) => {
      const children = item.props.children;
      let titleClassName = '';
      let content;
      
      React.Children.forEach(children, child => {
        if ((typeof child === 'object') && (child.type.displayName === 'TabTitle')) {
          if (child.props.className) {
            titleClassName += ' ' + child.props.className;
          }
          if ((this.state.active === i) && (child.props.classNameActive)) {
            titleClassName += ' ' + child.props.classNameActive;
          }
          content = child.props.children;
          return;
        }
      })

      return (
        <TabTitle className={titleClassName} onClick={this.clickHandler.bind(null, i)} key={i}>
          {content}
        </TabTitle>
      );
    });

    const tabs = React.Children.map(this.props.children, (item, i) => React.cloneElement(item, {
      key: i,
      active: (this.state.active === i) ? true : false
    }));

    return (
      <div className={className}>
        { !this.props.invert &&
          <nav className={menuClassName}>
            {titles}
          </nav>
        }
        <div className={panelClassName}>
          {tabs}
        </div>
        { this.props.invert &&
          <nav className={menuClassName}>
            {titles}
          </nav>
        }
      </div>
    );
  }
}
