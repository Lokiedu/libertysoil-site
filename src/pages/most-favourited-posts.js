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
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

import { API_HOST } from '../config';
import ApiClient from '../api/client';
import { ActionsTrigger } from '../triggers';

import { createSelector, currentUserSelector } from '../selectors';
import {
  resetCreatePostForm,
  updateCreatePostForm
} from '../actions/posts';
import BestPostsBasePage from './base/best-posts';

const LOAD_MORE_LIMIT = 50;

class MostFavouritedPostsPage extends React.Component {
  static async fetchData(router, store, client) {
    const triggers = new ActionsTrigger(client, store.dispatch);

    await triggers.loadMostFavouritedPosts({ ...router.location.query, limit: LOAD_MORE_LIMIT });
  }

  constructor(props, ...args) {
    super(props, ...args);
    this.triggers = new ActionsTrigger(
      new ApiClient(API_HOST),
      props.dispatch
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.location.query, nextProps.location.query)) {
      const query = { ...nextProps.location.query, limit: LOAD_MORE_LIMIT };
      this.triggers.loadMostFavouritedPosts(query);
    }
  }

  handleForceLoadPosts = async () => {
    const { river, location } = this.props;
    const query = { ...location.query, offset: river.size, limit: LOAD_MORE_LIMIT };
    const res = await this.triggers.loadMostFavouritedPosts(query);
    return Array.isArray(res) && res.length >= LOAD_MORE_LIMIT;
  }

  render() {
    return (
      <BestPostsBasePage
        {...this.props}
        title="Most Favourited Posts of"
        loadingInProgresss={this.props.ui.getIn(['progress', 'loadMostFavouritedPostsInProgress'])}
        onForceLoadPosts={this.handleForceLoadPosts}
        loadMoreLimit={LOAD_MORE_LIMIT}
        triggers={this.triggers}
      />
    );
  }
}

const selector = createSelector(
  currentUserSelector,
  state => state.get('comments'),
  state => state.get('create_post_form'),
  state => state.get('posts'),
  state => state.get('most_favourited_posts'),
  state => state.get('users'),
  state => state.get('ui'),
  (current_user, comments, create_post_form, posts, river, users, ui) => ({
    ...current_user,
    comments,
    create_post_form,
    posts,
    river,
    users,
    ui
  })
);

export default connect(selector, dispatch => ({
  dispatch,
  ...bindActionCreators({ resetCreatePostForm, updateCreatePostForm }, dispatch)
}))(MostFavouritedPostsPage);
