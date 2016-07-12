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
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import Gravatar from 'react-gravatar';
import { truncate } from 'grapheme-utils';
import { Link } from 'react-router';

import {
  uuid4 as uuid4PropType,
  mapOf as mapOfPropType
} from '../prop-types/common';
import {
  ArrayOfPostsId as ArrayOfPostsIdPropType,
  MapOfPosts as MapOfPostsPropType
} from '../prop-types/posts';
import { CommentsByCategory as CommentsByCategoryPropType } from '../prop-types/comments';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs';
import HeaderLogo from '../components/header-logo';
import NotFound from './not-found';
import Header from '../components/header';
import Footer from '../components/footer';
import { ShortTextPost, PostWrapper } from '../components/post';
import Sidebar from '../components/sidebar';
import RelatedPosts from '../components/related-posts';
import SidebarAlt from '../components/sidebarAlt';
import { API_HOST } from '../config';
import ApiClient from '../api/client';
import { addPost, setRelatedPosts } from '../actions/posts';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';

export class PostPage extends React.Component {
  static propTypes = {
    comments: CommentsByCategoryPropType.isRequired,
    params: PropTypes.shape({
      uuid: uuid4PropType.isRequired
    }).isRequired,
    posts: MapOfPostsPropType.isRequired,
    related_posts: mapOfPropType(uuid4PropType, ArrayOfPostsIdPropType)
  };

  static async fetchData(params, store, client) {
    const post = await client.postInfo(params.uuid);
    const relatedPosts = client.relatedPosts(params.uuid);

    store.dispatch(addPost(post));
    store.dispatch(setRelatedPosts(params.uuid, await relatedPosts));
  }

  render() {
    const {
      comments,
      current_user,
      is_logged_in,
      params,
      posts,
      related_posts,
      ui,
      users
    } = this.props;

    const post_uuid = params.uuid;

    if (!(post_uuid in posts)) {
      // not loaded yet
      return null;
    }

    const current_post = posts[post_uuid];

    if (current_post === false) {
      return <NotFound />;
    }

    const author = users[current_post.user_id];

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    const relatedPostIds = related_posts[current_post.id];
    const relatedPosts = (relatedPostIds)
                         ? relatedPostIds.map(id => posts[id])
                         : null;

    const authorUrl = getUrl(URL_NAMES.USER, { username: author.username });
    let authorName = author.username;

    if (author.more && (author.more.firstName || author.more.lastName)) {
      authorName = `${author.more.firstName} ${author.more.lastName}`;
    }

    return (
      <div>
        <Helmet title={`${current_post.more.pageTitle} on `} />
        <Header is_logged_in={is_logged_in} current_user={current_user}>
          <HeaderLogo small />
          <Breadcrumbs title={truncate(current_post.text, { length: 16 })}>
            <Link
              className="user_box__avatar user_box__avatar-round"
              title={authorName}
              to={authorUrl}
            >
              <Gravatar default="retro" md5={author.gravatarHash} size={23} />
            </Link>
          </Breadcrumbs>
        </Header>

        <Page>
          <Sidebar current_user={current_user} />
          <PageMain>
            <PageBody>
              <PageContent>
                <PostWrapper
                  author={author}
                  current_user={current_user}
                  users={users}
                  post={current_post}
                  comments={comments}
                  ui={ui}
                  showAllComments
                  triggers={triggers}
                >
                  <ShortTextPost post={current_post} />
                </PostWrapper>
              </PageContent>
              <SidebarAlt>
                <RelatedPosts
                  current_user={current_user}
                  posts={relatedPosts}
                  triggers={triggers}
                  users={users}
                />
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>

        <Footer />
      </div>
    );
  }
}

export default connect(defaultSelector)(PostPage);
