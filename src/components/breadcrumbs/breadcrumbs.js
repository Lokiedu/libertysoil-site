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
import throttle from 'lodash/throttle';
import isArray from 'lodash/isArray';
import compact from 'lodash/compact';
import keys from 'lodash/keys';
import isEqual from 'lodash/isEqual';

import { OldIcon as Icon } from '../icon';

const defaultShortView = (
  <Icon
    icon="keyboard-control"
    pack="md"
    size="common"
  />
);

export default class Breadcrumbs extends Component {
  static displayName = 'Breadcrumbs';

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    shortView: PropTypes.node,
    title: PropTypes.node
  };

  constructor(props, ...args) {
    super(props, ...args);

    this.state = {
      shouldDisplay: true,
      displayShortView: true,
      visibleCrumbs: null
    };

    this.childrenCount = props.children ? props.children.length : 0;
  }

  componentDidMount() {
    window.addEventListener('resize', this.resetVisibleCrumbs);
    document.addEventListener('updateBreadcrumbs', this.handleForceUpdate);

    setTimeout(this.resetVisibleCrumbs, 500);
  }

  componentWillReceiveProps(nextProps) {
    this.childrenCount = nextProps.children ? nextProps.children.length : 0;
    this.resetVisibleCrumbs();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props || !isEqual(nextState, this.state);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resetVisibleCrumbs);
    document.removeEventListener('updateBreadcrumbs', this.handleForceUpdate);
  }

  handleForceUpdate = throttle(({ detail }) => {
    if (detail) {
      const { shouldDisplay, displayShortView } = detail;
      const nextState = {};
      let callback;

      if (shouldDisplay !== undefined) {
        nextState.shouldDisplay = shouldDisplay;

        if (shouldDisplay) {
          nextState.visibleCrumbs = this.childrenCount;
          callback = this.updateVisibleCrumbs;
        }
      }
      if (displayShortView !== undefined) {
        nextState.displayShortView = displayShortView;
      }

      this.setState(nextState, callback);
    } else {
      this.setState({
        displayShortView: true,
        shouldDisplay: true,
        visibleCrumbs: this.childrenCount
      }, this.updateVisibleCrumbs);
    }
  }, 100);

  resetVisibleCrumbs = throttle(() => {
    this.setState({
      shouldDisplay: true,
      visibleCrumbs: this.childrenCount
    }, this.updateVisibleCrumbs);
  }, 250);

  updateVisibleCrumbs = () => {
    const breadcrumbsWidth = this._breadcrumbs.offsetWidth;
    const bodyWidth = this._body.offsetWidth;

    if (bodyWidth >= breadcrumbsWidth) {
      if (this.state.visibleCrumbs > 0) {
        this.setState((state) => ({
          visibleCrumbs: state.visibleCrumbs - 1
        }), this.updateVisibleCrumbs);
      } else {
        this.setState({ shouldDisplay: false });
      }
    }
  };

  renderShortView() {
    if (!this.state.displayShortView) {
      return null;
    }

    const { shortView } = this.props;
    if (shortView === null) {
      return null;
    }
    if (!shortView) {
      if (typeof this.props.title === 'string') {
        return (
          <div title={this.props.title}>
            {defaultShortView}
          </div>
        );
      }
      return defaultShortView;
    }
    return shortView;
  }

  renderCrumbs(crumbs = []) {
    let visibleCrumbs = this.state.visibleCrumbs;
    if (!this.state.shouldDisplay) {
      return this.renderShortView();
    }

    let isCollapsed = [];

    if (!isArray(crumbs)) {
      crumbs = [crumbs];
    }

    isCollapsed = crumbs.map(() => ((visibleCrumbs-- <= 0))).reverse();

    const checkType = (typeDef) => {
      return (
        (typeof typeDef.propTypes === 'object') &&
        keys(typeDef.propTypes).find(v => v === 'collapsed')
      );
    };

    return compact(crumbs).map((crumb, i) => {
      const props = {};
      const { type: typeDef } = crumb;

      let className = 'breadcrumbs__item';
      if ((typeDef instanceof Function) && checkType(typeDef)) {
        props.collapsed = isCollapsed[i];

        if (!isCollapsed[i] && crumb.props && crumb.props.name) {
          className += ' breadcrumbs__item--narrow';
        }
      }

      return (
        <div className={className} key={i}>
          {cloneElement(crumb, props)}
        </div>
      );
    });
  }

  renderTitle(title) {
    if (!title || !this.state.shouldDisplay) {
      return null;
    }

    return (
      <div className="breadcrumbs__item breadcrumbs__title">
        {title}
      </div>
    );
  }

  render() {
    const {
      children,
      className,
      title,
      ...props
    } = this.props;

    let cn = 'breadcrumbs header__breadcrumbs';
    if (this.state.shouldDisplay) {
      cn += ' breadcrumbs--opened';
    }
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
