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

export default class VisibilitySensor extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onMount: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    delay: PropTypes.number,
    active: PropTypes.bool
  };

  static defaultProps = {
    delay: 1000,
    active: true,
    onMount: () => {}
  };

  watch = null;
  wasVisible = null;

  componentDidMount() {
    this.toggleCheck();
  }

  componentWillReceiveProps() {
    this.toggleCheck();
  }

  componentWillUnmount() {
    if (this.watch) {
      clearInterval(this.watch);
      this.props.onChange(false);
    }
  }

  toggleCheck() {
    switch (this.props.active) {
      case true: {
        if (!this.watch) {
          this.watch = setInterval(this.checkVisibility, this.props.delay);
        }
        break;
      }
      case false: {
        if (this.watch) {
          clearInterval(this.watch);
          this.watch = null;
        }
        break;
      }
    }
  }

  getVisibility() {
    return this.checkVisibility();
  }

  checkVisibility = () => {
    const pos = this.node.getBoundingClientRect();
    const win = { width: window.outerWidth, height: window.outerHeight };
    function check(p = 0, w = 0) {
      return ((w - p > 0) && (p - w < w));
    }
    
    let isVisible;

    if (!pos.width) {
      isVisible = false;
    } else {
      switch (check(pos.top, win.height) || check(pos.bottom, win.height)) {
        case true: {
          if (check(pos.right, win.width) || check(pos.left, win.width)) {
            isVisible = true;
          } else {
            isVisible = false;
          }
          break;
        }

        case false: {
          isVisible = false;
          break;
        }
      }
    }

    if (typeof this.wasVisible === 'object') {
      this.props.onMount(isVisible);
    } else if (isVisible !== this.wasVisible) {
      this.props.onChange(isVisible);
    }
    this.wasVisible = isVisible;

    return isVisible;
  };

  render() {
    return (
      <div ref={(c) => this.node = c} className="visibility_sensor">
        {this.props.children}
      </div>
    );
  }
}
