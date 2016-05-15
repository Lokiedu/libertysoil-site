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
import React, { cloneElement, Component, PropTypes } from 'react';
import { throttle, isArray, compact } from 'lodash';

export default class Breadcrumbs extends Component {
  static displayName = 'Breadcrumbs';

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    title: PropTypes.node
  };

  constructor(props) {
    super(props);

    this.state = {
      visibleCrumbs: null
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resetVisibleCrumbs);
    document.addEventListener('DOMContentLoaded', this.resetVisibleCrumbs);
  }

  componentWillReceiveProps() {
    this.resetVisibleCrumbs();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resetVisibleCrumbs);
    document.removeEventListener('DOMContentLoaded', this.resetVisibleCrumbs);
  }

  resetVisibleCrumbs = throttle(() => {
    const { children } = this.props;
    let childrenCount = 0;

    if (children) {
      childrenCount = children.length;
    }

    this.setState({
      visibleCrumbs: childrenCount
    }, this.updateVisibleCrumbs);
  }, 100);

  updateVisibleCrumbs = () => {
    const breadcrumbsWidth = this._breadcrumbs.offsetWidth;
    const bodyWidth = this._body.offsetWidth;

    if (bodyWidth >= breadcrumbsWidth) {
      if (this.state.visibleCrumbs > 0) {
        this.setState({
          visibleCrumbs: this.state.visibleCrumbs - 1
        }, this.updateVisibleCrumbs);
      }
    }
  };

  renderCrumbs(crumbs = []) {
    let visibleCrumbs = this.state.visibleCrumbs;
    let isCollapsed = [];

    if (!isArray(crumbs)) {
      crumbs = [crumbs];
    }

    isCollapsed = crumbs.map(() => ((visibleCrumbs-- <= 0))).reverse();

    return compact(crumbs).map((crumb, i) => (
      <div className="breadcrumbs__item" key={i}>
        {cloneElement(crumb, {
          collapsed: isCollapsed[i]
        })}
      </div>
    ));
  }

  renderTitle(title) {
    let titleComponent = null;

    if (title) {
      titleComponent = <div className="breadcrumbs__item breadcrumbs__title">{title}</div>;
    }

    return titleComponent;
  }

  render() {
    const {
      children,
      className,
      title,
      ...props
    } = this.props;

    let cn = 'breadcrumbs header__breadcrumbs';
    if (className) {
      cn += ` ${className}`;
    }

    return (
      <div className={cn} ref={c => this._breadcrumbs = c} {...props}>
        <div className="breadcrumbs__body" ref={c => this._body = c}>
          {this.renderCrumbs(children)}
          {this.renderTitle(title)}
        </div>
      </div>
    );
  }
}
