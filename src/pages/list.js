/*
 This file is a part of libertysoil.org website
 Copyright (C) 2015  Loki Education (Social Enterprise)

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
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import VisibilitySensor from 'react-visibility-sensor';

import {API_HOST} from '../config';
import ApiClient from '../api/client';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import CreatePost from '../components/create-post';
import Header from '../components/header';
import HeaderLogo from '../components/header-logo';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import AddedTags from '../components/post/added-tags';
import Button from '../components/button';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs';
import SideSuggestedUsers from '../components/side-suggested-users';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import {
  resetCreatePostForm,
  updateCreatePostForm,
  clearRiver
} from '../actions';

const client = new ApiClient(API_HOST);

export class List extends React.Component {
  static displayName = 'List';

  static propTypes = {
    create_post_form: PropTypes.shape({
      text: PropTypes.string.isRequired
    }),
    ui: PropTypes.shape({
      progress: PropTypes.shape({
        loadRiverInProgress: PropTypes.boolean
      })
    }).isRequired,
    river: PropTypes.arrayOf(PropTypes.string).isRequired,
    current_user: PropTypes.shape({

    }).isRequired
  };

  state = {
    downloadAttemptsCount: 0,
    displayLoadMore: true
  };

  static async fetchData(params, store, client) {
    let trigger = new ActionsTrigger(client, store.dispatch);

    store.dispatch(clearRiver());

    await Promise.all([
      trigger.loadSchools(),
      trigger.loadPostRiver(),
      trigger.loadPersonalizedSuggestions(),
      trigger.loadUserRecentTags()
    ]);
  }

  loadMore = async (isVisible) => {
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    if (isVisible && !this.props.ui.progress.loadRiverInProgress && this.state.downloadAttemptsCount < 1) {
      this.setState({
        downloadAttemptsCount: this.state.downloadAttemptsCount + 1
      });
      let res = await triggers.loadPostRiver(this.props.river.length);

      let displayLoadMore = false;
      if (res === false) { // bad response
        displayLoadMore = true;
      }
      if (res.length) { // no more posts
        displayLoadMore = true;
      }
      this.setState({
        displayLoadMore: displayLoadMore
      });
    }

    if (!isVisible) {
      this.setState({
        downloadAttemptsCount: 0
      });
    }
  };

  render() {
    const {
      current_user,
      i_am_following,
      resetCreatePostForm,
      updateCreatePostForm,
      ui,
      river,
      posts,
      comments,
      users
    } = this.props;

    const actions = {resetCreatePostForm, updateCreatePostForm};
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    let loadMore;
    if (this.state.displayLoadMore) {
      loadMore = (
        <div className="layout layout-align_center layout__space layout__space-double">
          <VisibilitySensor onChange={this.loadMore}>
            <Button
              title="Load more..." waiting={ui.progress.loadRiverInProgress}
              onClick={triggers.loadPostRiver.bind(null, river.length)} />
          </VisibilitySensor>
        </div>
      );
    } else {
      loadMore = <VisibilitySensor onChange={this.loadMore} />;
    }

    return (
      <div>
        <Helmet title="News Feed of " />
        <Header is_logged_in={this.props.is_logged_in} current_user={this.props.current_user}>
          <HeaderLogo />
          <Breadcrumbs title="News Feed" />
        </Header>

        <Page>
          <Sidebar current_user={this.props.current_user} />
          <PageMain>
            <PageBody>
              <PageContent>
                <CreatePost
                  actions={actions}
                  allSchools={_.values(this.props.schools)}
                  defaultText={this.props.create_post_form.text}
                  triggers={triggers}
                  userRecentTags={current_user.recent_tags}
                  {...this.props.create_post_form}
                />
                <River
                  river={river}
                  posts={posts}
                  users={users}
                  current_user={current_user}
                  triggers={triggers}
                  ui={ui}
                  comments={comments}
                />
                {loadMore}
              </PageContent>
              <SidebarAlt>
                <AddedTags {...this.props.create_post_form} />
                <SideSuggestedUsers
                  current_user={current_user}
                  i_am_following={i_am_following}
                  triggers={triggers}
                  users={current_user.suggested_users}
                />
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>

        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector, dispatch => ({
  dispatch,
  ...bindActionCreators({resetCreatePostForm, updateCreatePostForm}, dispatch)
}))(List);
