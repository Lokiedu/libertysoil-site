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

import Tab from './tab';

export default class Tabs extends React.Component {
  static displayName = 'Tabs';

  static propTypes = {
    children: PropTypes.node
  };

  constructor(props) {
    super(props);

    this.state = {
      active: 0
    };
  }

  to = (index) => {
    this.setState({ active: index });
  };

  processChildren() {
    return React.Children.map(this.props.children, child =>
      this.processChild(child)
    );
  }

  processChild = (node) => {
    if (typeof node !== 'object' || !node) {
      return node;
    }

    const index = node.props.index;

    if (node.type.displayName === Tab.Title.displayName) {
      return React.cloneElement(node, {
        active: index === this.state.active,
        _toggle: this.to
      });
    }
    if (node.type.displayName === Tab.Content.displayName) {
      return React.cloneElement(node, {
        active: index === this.state.active
      });
    }

    return React.cloneElement(node, {
      children: React.Children.map(node.props.children, child => this.processChild(child))
    });
  }

  render() {
    const children = this.processChildren();

    return (
      <div className="tabs">
        {children}
      </div>
    );
  }
}
