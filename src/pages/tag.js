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
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { setTagPosts } from '../actions';

import {
  Page,
  PageMain,
  PageCaption,
  PageHero,
  PageBody,
  PageContent
}                           from '../components/page';
import Breadcrumbs          from '../components/breadcrumbs';
import Header               from '../components/header';
import HeaderLogo           from '../components/header-logo';
import Panel                from '../components/panel';
import Footer               from '../components/footer';
import River                from '../components/river_of_posts';
import Sidebar              from '../components/sidebar';
import SidebarAlt           from '../components/sidebarAlt';
import Tag                  from '../components/tag';
import TagIcon              from '../components/tag-icon';
import FollowTagButton      from '../components/follow-tag-button';
import LikeTagButton        from '../components/like-tag-button';
import { ActionsTrigger }   from '../triggers';
import { defaultSelector }  from '../selectors';
import { TAG_HASHTAG }      from '../consts/tags';


export class TagPage extends Component {
  static displayName = 'TagPage';

  static async fetchData(params, store, client) {
    let tagPosts = client.tagPosts(params.tag);
    store.dispatch(setTagPosts(params.tag, await tagPosts));
  }

  render() {
    const {
      is_logged_in,
      current_user,
      posts,
      tag_posts,
      users,
      params
    } = this.props;

    const tag = params.tag;

    let toolbarPrimary = [];
    let toolbarSecondary = [];

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    const thisTagPosts = tag_posts[this.props.params.tag] || [];
    const followedTags = (current_user) ? current_user.followed_hashtags : {};
    const likeTriggers = {
      likeTag: triggers.likeHashtag,
      unlikeTag: triggers.unlikeHashtag
    };

    if (is_logged_in) {
      toolbarSecondary = [
        <LikeTagButton
          key="like"
          is_logged_in={is_logged_in}
          liked_tags={current_user.liked_hashtags}
          tag={tag}
          triggers={likeTriggers}
          outline={true}
        />
      ];

      toolbarPrimary = [
        <div key="posts" className="panel__toolbar_item-text">
          {thisTagPosts.length} posts
        </div>,
        <button key="new" className="button button-midi button-ligth_blue" type="button">New</button>,
        <FollowTagButton
          key="follow"
          current_user={current_user}
          followed_tags={followedTags}
          tag={tag}
          triggers={triggers}
          className="button-midi"
        />
      ];
    }

    return (
      <div>
        <Helmet title={`"${tag}" posts on `} />
        <Header is_logged_in={is_logged_in} current_user={current_user}>
          <HeaderLogo small />
          <div className="header__breadcrumbs">
            <Breadcrumbs>
              <Link to="/tag" title="All Hashtags">
                <TagIcon inactive type={TAG_HASHTAG} />
              </Link>
              <Tag name={this.props.params.tag} type={TAG_HASHTAG} urlId={this.props.params.tag} />
            </Breadcrumbs>
          </div>
        </Header>
        <Page>
          <Sidebar current_user={current_user} />
          <PageMain>
            <PageCaption>
              {tag}
            </PageCaption>
            <PageHero>
              <img src="/images/hero/welcome.jpg" />
            </PageHero>
            <PageBody className="page__body-up">
              <Panel
                title={tag}
                icon={<Tag size="BIG" type={TAG_HASHTAG} urlId={tag} />}
                toolbarPrimary={toolbarPrimary}
                toolbarSecondary={toolbarSecondary}
              ></Panel>
            </PageBody>
            <PageBody className="page__body-up layout__space_alt">
              <PageContent>
                <River river={thisTagPosts} posts={posts} users={users} current_user={current_user} triggers={triggers}/>
              </PageContent>
              <SidebarAlt />
            </PageBody>
          </PageMain>
        </Page>
        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(TagPage);
