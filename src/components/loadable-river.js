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
import PropTypes from 'prop-types';

import React from 'react';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import clone from 'lodash/clone';
import isEqual from 'lodash/isEqual';
import { List } from 'immutable';

import LoadMore from './load-more';
import River from './river_of_posts';

export default class LoadableList extends React.PureComponent {
  static contextTypes = {
    router: PropTypes.func.isRequired
  };

  static defaultProps = {
    autoload: true,
    component: River,
    loadMoreLimit: 4,
    onAutoLoad: noop,
    onForceLoad: noop,
    river: List(),
    waiting: false
  };

  constructor(props, context, ...args) {
    super(props, context, ...args);

    this.state = {
      displayLoadMore:
        props.waiting ||
        props.river.size >= props.loadMoreLimit
    };

    this.query = clone(context.router.location.query);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { query: nextQuery } = nextContext.router.location;
    if (!isEqual(this.query, nextQuery)) {
      this.setState({ displayLoadMore: true });
      this.query = clone(nextQuery);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props
      || nextState.displayLoadMore !== this.state.displayLoadMore;
  }

  handleAutoLoad = async (...args) => {
    if (!this.props.autoload) {
      return;
    }

    const displayLoadMore = await this.props.onAutoLoad(...args);

    if (displayLoadMore !== undefined) {
      this.setState({ displayLoadMore });
    }
  };

  handleForceLoad = async (...args) => {
    const displayLoadMore = await this.props.onForceLoad(...args);

    if (displayLoadMore !== undefined) {
      this.setState({ displayLoadMore });
    }
  };

  render() {
    const { className, waiting, ...props } = this.props;

    return (
      <div className={className}>
        <this.props.component {...omit(props, ['onAutoLoad', 'onForceLoad'])} />
        {this.state.displayLoadMore &&
          <LoadMore
            waiting={waiting}
            onClick={this.handleForceLoad}
            onVisibilityChange={this.handleAutoLoad}
          />
        }
      </div>
    );
  }
}
