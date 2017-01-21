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
import i from 'immutable';

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
  CurrentUser as CurrentUserPropType,
  MapOfUsers as MapOfUsersPropType
} from '../prop-types/users';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../components/page';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs';
import HeaderLogo from '../components/header-logo';
import Header from '../components/header';
import Footer from '../components/footer';
import { ShortTextPost, PostWrapper } from '../components/post';
import Sidebar from '../components/sidebar';
import RelatedPosts from '../components/related-posts';
import SidebarAlt from '../components/sidebarAlt';
import { API_HOST } from '../config';
import ApiClient from '../api/client';
import { addPost, setRelatedPosts } from '../actions/posts';
import { addError } from '../actions/messages';
import { ActionsTrigger } from '../triggers';
import { createSelector, currentUserSelector } from '../selectors';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';

import NotFound from './not-found';

export class UnwrappedPostPage extends React.Component {
  static propTypes = {
    comments: CommentsByCategoryPropType.isRequired,
    current_user: CurrentUserPropType,
    is_logged_in: PropTypes.bool.isRequired,
    params: PropTypes.shape({
      uuid: uuid4PropType.isRequired
    }).isRequired,
    posts: MapOfPostsPropType.isRequired,
    related_posts: mapOfPropType(uuid4PropType, ArrayOfPostsIdPropType),
    users: MapOfUsersPropType.isRequired
  };

  static async fetchData(router, store, client) {
    try {
      const post = await client.postInfo(router.params.uuid);
      store.dispatch(addPost(post));
    } catch (e) {
      store.dispatch(addPost({ id: router.params.uuid, error: true }));
      return 404;
    }

    try {
      const relatedPosts = await client.relatedPosts(router.params.uuid);
      store.dispatch(setRelatedPosts(router.params.uuid, relatedPosts));
    } catch (e) {
      store.dispatch(addError(e.message));
    }

    return 200;
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

    const current_post = posts.get(post_uuid);
    if (!current_post) {
      // not loaded yet
      return null;
    }

    if (current_post.get('error')) {
      return <NotFound />;
    }

    const author = users.get(current_post.get('user_id'));

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    const relatedPosts = (related_posts.get(current_post.get('id')) || i.List())
      .map(id => posts.get(id));

    const authorUrl = getUrl(URL_NAMES.USER, { username: author.username });
    let authorName = author.username;

    if (author.more && (author.more.firstName || author.more.lastName)) {
      authorName = `${author.more.firstName} ${author.more.lastName}`;
    }

    return (
      <div>
        <Helmet title={`${current_post.getIn(['more', 'pageTitle'])} on `} />
        <Header current_user={current_user} is_logged_in={is_logged_in}>
          <HeaderLogo small />
          <Breadcrumbs title={truncate(current_post.get('text'), { length: 16 })}>
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
          <PageMain>
            <PageBody>
              <Sidebar />
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
                  posts={relatedPosts}
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

const selector = createSelector(
  currentUserSelector,
  state => state.get('comments'),
  state => state.get('posts'),
  state => state.get('related_posts'),
  state => state.get('ui'),
  state => state.get('users'),
  (current_user, comments, posts, related_posts, ui, users) => ({
    comments,
    posts,
    related_posts,
    ui,
    users,
    ...current_user
  })
);

const PostPage = connect(selector)(UnwrappedPostPage);
export default PostPage;
