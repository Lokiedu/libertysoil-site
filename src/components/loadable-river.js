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
import React from 'react';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import { List } from 'immutable';

import LoadMore from './load-more';
import River from './river_of_posts';

export default class LoadableRiver extends React.Component {
  static defaultProps = {
    loadMoreLimit: 4,
    onAutoLoad: noop,
    onForceLoad: noop,
    river: List(),
    waiting: false
  };

  constructor(props, ...args) {
    super(props, ...args);

    this.state = {
      displayLoadMore: props.river.size > props.loadMoreLimit
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props
      || nextState.displayLoadMore !== this.state.displayLoadMore;
  }

  handleAutoLoad = async (...args) => {
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
        <River {...omit(props, ['onAutoLoad', 'onForceLoad'])} />
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
