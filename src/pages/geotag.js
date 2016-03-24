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
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import _, { isEmpty } from 'lodash';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import {
  setGeotagPosts,
  addGeotag,
  resetCreatePostForm,
  updateCreatePostForm
} from '../actions';
import NotFound from './not-found';

import {
  Page,
  PageMain,
  PageCaption,
  PageHero,
  PageBody,
  PageContent
} from '../components/page';
import CreatePost from '../components/create-post';
import Breadcrumbs from '../components/breadcrumbs';
import Header from '../components/header';
import HeaderLogo from '../components/header-logo';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import AddedTags from '../components/post/added-tags';
import Panel from '../components/panel';
import Tag from '../components/tag';
import TagIcon from '../components/tag-icon';
import FollowTagButton from '../components/follow-tag-button';
import LikeTagButton from '../components/like-tag-button';

import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import { TAG_LOCATION, TAG_PLANET } from '../consts/tags';


export class GeotagPage extends Component {
  static displayName = 'GeotagPage';

  static propTypes = {
    geotag_posts: PropTypes.shape().isRequired,
    geotags: PropTypes.shape().isRequired,
    params: PropTypes.shape({
      url_name: PropTypes.string.isRequired
    })
  };

  static async fetchData(params, store, client) {
    let geotag = client.getGeotag(params.url_name);
    let geotagPosts = client.geotagPosts(params.url_name);

    try {
      geotag = await geotag;
    } catch (e) {
      store.dispatch(addGeotag({url_name: params.url_name}));

      return 404;
    }

    store.dispatch(addGeotag(geotag));
    store.dispatch(setGeotagPosts(params.url_name, await geotagPosts));

    const trigger = new ActionsTrigger(client, store.dispatch);
    Promise.all([
      trigger.loadSchools(),
      trigger.loadUserRecentTags()
    ]);

    return 200;
  }

  state = {
    form: false
  };

  componentWillReceiveProps(nextProps) {
    if (this.state.form) {
      const postGeotags = this.props.create_post_form.geotags;
      const index = postGeotags.findIndex(tag => tag.url_name === nextProps.params.url_name);

      if (index < 0) {
        this.setState({ form: false });
      }
    }
  }

  toggleForm = () => {
    if (!this.state.form) {
      const geotag = this.props.geotags[this.props.params.url_name];
      this.props.resetCreatePostForm();
      this.props.updateCreatePostForm({ geotags: [geotag] });
    }

    this.setState({ form: !this.state.form });
  };

  render() {
    const {
      is_logged_in,
      current_user,
      posts,
      resetCreatePostForm,
      updateCreatePostForm,
      geotags,
      geotag_posts,
      users
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const actions = {resetCreatePostForm, updateCreatePostForm};

    const geotag = geotags[this.props.params.url_name];
    const title = geotag ? geotag.name : this.props.params.url_name;

    if (!geotag) {
      return <script />;
    }

    if (!geotag.id) {
      return <NotFound/>;
    }

    let tagPosts = geotag_posts[this.props.params.url_name] || [];

    let followTriggers = {
      followTag: triggers.followGeotag,
      unfollowTag: triggers.unfollowGeotag
    };

    let likeTriggers = {
      likeTag: triggers.likeGeotag,
      unlikeTag: triggers.unlikeGeotag
    };

    let toolbarPrimary = [];
    let toolbarSecondary = [];

    let createPostForm;
    let addedTags;

    if (is_logged_in) {
      toolbarSecondary = [
        <LikeTagButton
          key="like"
          is_logged_in={is_logged_in}
          liked_tags={current_user.liked_geotags}
          tag={this.props.params.url_name}
          triggers={likeTriggers}
          outline={true}
          size="midl"
        />
      ];

      toolbarPrimary = [
        <div key="posts" className="panel__toolbar_item-text">
          {tagPosts.length} posts
        </div>,
        <button key="new" onClick={this.toggleForm} className="button button-midi button-light_blue" type="button">New</button>,
        <FollowTagButton
          key="follow"
          current_user={current_user}
          followed_tags={current_user.followed_geotags}
          tag={this.props.params.url_name}
          triggers={followTriggers}
          className="button-midi"
        />
      ];

      if (this.state.form) {
        createPostForm = (
          <CreatePost
            actions={actions}
            allSchools={_.values(this.props.schools)}
            defaultText={this.props.create_post_form.text}
            triggers={triggers}
            userRecentTags={current_user.recent_tags}
            {...this.props.create_post_form}
          />
        );
        addedTags = <AddedTags {...this.props.create_post_form} />;
      }
    }

    return (
      <div>
        <Helmet title={`${geotag.name} posts on `} />
        <Header is_logged_in={is_logged_in} current_user={current_user}>
          <HeaderLogo small />
          <Breadcrumbs>
            <Link title="All Geotags" to="/geotag">
              <TagIcon inactive type={TAG_PLANET} />
            </Link>
            {!isEmpty(geotag.continent) &&
              <Tag
                inactive={geotag.type != 'Continent'}
                name={geotag.continent.name}
                type={TAG_LOCATION}
                urlId={geotag.continent.url_name}
              />
            }
            {!isEmpty(geotag.country) &&
              <Tag
                inactive={geotag.type != 'Country'}
                name={geotag.country.name}
                type={TAG_LOCATION}
                urlId={geotag.country.url_name}
              />
            }
            {!isEmpty(geotag.admin1) &&
              <Tag
                inactive={geotag.type != 'AdminDivision1'}
                name={geotag.admin1.name}
                type={TAG_LOCATION}
                urlId={geotag.admin1.url_name}
              />
            }
            <Tag name={geotag.name} type={TAG_LOCATION} urlId={geotag.url_name} />
          </Breadcrumbs>
        </Header>

        <Page>
          <Sidebar current_user={current_user} />
          <PageMain className="page__main-no_space">
            <PageCaption>
              {`${title} `}<span className="page__caption_highlight">Education</span>
            </PageCaption>
            <PageHero src="/images/hero/welcome.jpg" />
            <PageBody className="page__body-up">
              <PageContent>
                <Panel
                  title={title}
                  icon={<Tag size="BIG" type={TAG_LOCATION} urlId={geotag.url_name} />}
                  toolbarPrimary={toolbarPrimary}
                  toolbarSecondary={toolbarSecondary}
                >
                  Short wikipedia description about this location will be displayed here soon.
                </Panel>
              </PageContent>
            </PageBody>
            <PageBody className="page__body-up layout__space_alt">
              <PageContent>
                {createPostForm}
                <River
                  river={tagPosts}
                  posts={posts}
                  users={users}
                  current_user={current_user}
                  triggers={triggers}
                />
              </PageContent>
              <SidebarAlt>
                {addedTags}
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
}))(GeotagPage);
