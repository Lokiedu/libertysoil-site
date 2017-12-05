/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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
import { noop, omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

function resolveToLocation(to, router) {
  return typeof to === 'function'
    ? to(router.location)
    : to;
}

export default class ContextualLink extends React.PureComponent {
  static displayName = 'ContextualLink';

  static propTypes = {
    altTo: PropTypes.string,
    onClick: PropTypes.func
  };

  static propsToIgnore = ['altTo'];

  static defaultProps = {
    onClick: noop
  };

  static contextProps = {
    router: PropTypes.shape()
  };

  constructor(props, context) {
    super(props, context);
    this.innerProps = omit(props, ContextualLink.propsToIgnore);
  }

  componentWillReceiveProps(nextProps) {
    this.innerProps = omit(nextProps, ContextualLink.propsToIgnore);
  }

  handleClick = (e) => {
    this.props.onClick(e);

    if (typeof this.props.altTo === 'undefined') {
      return;
    }

    if (!e.defaultPrevented) {
      e.preventDefault();
    }

    this.context.router.push(
      resolveToLocation(this.props.altTo, this.context.router)
    );
  };

  render() {
    return (
      <Link
        {...this.innerProps}
        onClick={this.handleClick}
      />
    );
  }
}
