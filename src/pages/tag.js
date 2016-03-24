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
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import _ from 'lodash';

import ApiClient from '../api/client';
import { API_HOST } from '../config';
import {
  addHashtag,
  setTagPosts,
  resetCreatePostForm,
  updateCreatePostForm
} from '../actions';

import {
  Page,
  PageMain,
  PageCaption,
  PageHero,
  PageBody,
  PageContent
}                           from '../components/page';
import CreatePost from '../components/create-post';
import Breadcrumbs          from '../components/breadcrumbs';
import Header               from '../components/header';
import HeaderLogo           from '../components/header-logo';
import Panel                from '../components/panel';
import Footer               from '../components/footer';
import River                from '../components/river_of_posts';
import Sidebar              from '../components/sidebar';
import SidebarAlt           from '../components/sidebarAlt';
import AddedTags from '../components/post/added-tags';
import Tag                  from '../components/tag';
import TagIcon              from '../components/tag-icon';
import FollowTagButton      from '../components/follow-tag-button';
import LikeTagButton        from '../components/like-tag-button';
import { ActionsTrigger }   from '../triggers';
import { defaultSelector }  from '../selectors';
import { TAG_HASHTAG }      from '../consts/tags';

export class TagPage extends Component {
  static displayName = 'TagPage';

  static propTypes = {
    tag_posts: PropTypes.shape().isRequired,
    hashtags: PropTypes.shape().isRequired,
    params: PropTypes.shape({
      tag: PropTypes.string.isRequired
    })
  };

  static async fetchData(params, store, client) {
    let hashtag = client.getHashtag(params.tag);
    let tagPosts = client.tagPosts(params.tag);

    try {
      hashtag = await hashtag;
    } catch (e) {
      store.dispatch(addHashtag({name: params.tag}));

      return 404;
    }

    store.dispatch(addHashtag(hashtag));
    store.dispatch(setTagPosts(params.tag, await tagPosts));

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
      const postHashtags = this.props.create_post_form.hashtags;
      const index = postHashtags.findIndex(tag => tag.name === nextProps.params.tag);

      if (index < 0) {
        this.setState({ form: false });
      }
    }
  }

  toggleForm = () => {
    if (!this.state.form) {
      const hashtag = this.props.hashtags[this.props.params.tag];
      this.props.resetCreatePostForm();
      this.props.updateCreatePostForm({ hashtags: [hashtag] });
    }

    this.setState({ form: !this.state.form });
  };

  render() {
    const {
      is_logged_in,
      current_user,
      posts,
      tag_posts,
      resetCreatePostForm,
      updateCreatePostForm,
      users,
      params,
      hashtags
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const actions = {resetCreatePostForm, updateCreatePostForm};

    const tag = hashtags[params.tag];

    if (!tag) {
      return <script />;
    }

    const thisTagPosts = tag_posts[tag.name] || [];
    const followedTags = (current_user) ? current_user.followed_hashtags : {};
    const likeTriggers = {
      likeTag: triggers.likeHashtag,
      unlikeTag: triggers.unlikeHashtag
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
          liked_tags={current_user.liked_hashtags}
          tag={tag}
          triggers={likeTriggers}
          outline={true}
          size="midl"
        />
      ];

      toolbarPrimary = [
        <div key="posts" className="panel__toolbar_item-text">
          {thisTagPosts.length} posts
        </div>,
        <button key="new" onClick={this.toggleForm} className="button button-midi button-light_blue" type="button">
          New
        </button>,
        <FollowTagButton
          key="follow"
          current_user={current_user}
          followed_tags={followedTags}
          tag={tag.name}
          triggers={triggers}
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
        <Helmet title={`"${tag.name}" posts on `} />
        <Header is_logged_in={is_logged_in} current_user={current_user}>
          <HeaderLogo small />
          <Breadcrumbs>
            <Link to="/tag" title="All Hashtags">
              <TagIcon inactive type={TAG_HASHTAG} />
            </Link>
            <Tag name={tag.name} type={TAG_HASHTAG} urlId={tag.name} />
          </Breadcrumbs>
        </Header>
        <Page>
          <Sidebar current_user={current_user} />
          <PageMain className="page__main-no_space">
            <PageCaption>
              {tag.name}
            </PageCaption>
            <PageHero src="/images/hero/welcome.jpg" />
            <PageBody className="page__body-up">
              <Panel
                title={tag.name}
                icon={<Tag size="BIG" type={TAG_HASHTAG} urlId={tag.name} />}
                toolbarPrimary={toolbarPrimary}
                toolbarSecondary={toolbarSecondary}
              ></Panel>
            </PageBody>
            <PageBody className="page__body-up layout__space_alt">
              <PageContent>
                {createPostForm}
                <River river={thisTagPosts} posts={posts} users={users} current_user={current_user} triggers={triggers}/>
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
}))(TagPage);
