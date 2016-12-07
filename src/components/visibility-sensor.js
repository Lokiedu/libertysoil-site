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
import { difference, entries, omit } from 'lodash';

/**
 * Checks visibility of given child nodes*
 * *Correctly: visibility of the wrapper covered around children
 *
 * Computes an update loop with `props.delay` ms interval between iterations.
 * Calls `props.onChange(isVisible)` after each noticed change of visibility status.
 * May be toggled off and on by passing `props.active`.
 * Calls `props.onMount(isVisible)` right after mounting or first `props.active === true`
 *
 * @param {Boolean}  active   Is component active
 * @param {Node}     children
 * @param {Number}   delay    Interval of update
 * @param {Function} onChange Called after change of visibility status
 * @param {Function} onMount  Called at the start of work cycle
 *
 * @property {Number}  watch      Represents intervalID of 'update loop'
 * @property {Boolean} wasVisible Was the root node visible in the last update?
 *
 * @method getVisibility Checks and returns node's current visibility status.
 */
export default class VisibilitySensor extends Component {
  static propTypes = {
    active: PropTypes.bool,
    children: PropTypes.node.isRequired,
    delay: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    onMount: PropTypes.func
  };

  static defaultProps = {
    active: true,
    delay: 1000,
    onChange: () => {},
    onMount: () => {}
  };

  constructor(props) {
    super(props);

    this.watch = null;
    this.wasVisible = null;
  }

  componentDidMount() {
    this.toggleCheck();
  }

  componentWillReceiveProps(nextProps) {
    const next = entries(omit(nextProps, ['children']));
    const old = entries(omit(this.props, ['children']));
    const updatedKeys = difference(next, old).map(p => p[0]);
    this.toggleCheck(nextProps, updatedKeys);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  componentWillUnmount() {
    if (this.watch) {
      clearInterval(this.watch);
      this.props.onChange(false);
    }
  }

  /**
   * Toggles update loop.
   * @param  {Object}        props       Props instance (may be `nextProps`).
   * @param  {Array<String>} updatedKeys Array of updated properties' names.
   * @return {undefined}
   */
  toggleCheck(props = this.props, updatedKeys = []) {
    if (props.active) { // need to work
      if (this.watch) { // in progress
        if (updatedKeys.includes('delay')) {
          clearInterval(this.watch);
          this.watch = setInterval(this.checkVisibility, props.delay);
        }
      } else { // switched off
        this.watch = setInterval(this.checkVisibility, props.delay);
      }
    } else if (this.watch) { // need to be stopped
      clearInterval(this.watch);
      this.watch = null;
    }
  }

  /**
   * Checks and returns node's current visibility status.
   * @return {Boolean}
   */
  getVisibility() {
    return this.checkVisibility();
  }

  checkVisibility = () => {
    const pos = this.node.getBoundingClientRect();
    const win = { width: window.outerWidth, height: window.outerHeight };
    function check(p = 0, w = 0) {
      return ((w - p > 0) && (p - w < w));
    }

    let isVisible = false;
    if (pos.width) {
      if (check(pos.top, win.height) || check(pos.bottom, win.height)) {
        if (check(pos.right, win.width) || check(pos.left, win.width)) {
          isVisible = true;
        }
      }
    }

    if (this.wasVisible === null) {
      this.props.onMount(isVisible);
    } else if (isVisible !== this.wasVisible) {
      this.props.onChange(isVisible);
    }

    this.wasVisible = isVisible;
    return isVisible;
  };

  render() {
    return (
      <div className="visibility_sensor" ref={c => this.node = c}>
        {this.props.children}
      </div>
    );
  }
}
