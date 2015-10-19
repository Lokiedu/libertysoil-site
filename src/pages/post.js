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
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import NotFound from './not-found'
import Header from '../components/header';
import Footer from '../components/footer';
import CurrentUser from '../components/current-user';
import { ShortTextPost, PostWrapper } from '../components/post'
import {API_HOST} from '../config';
import ApiClient from '../api/client'
import {getStore, addPost} from '../store';
import {likePost, unlikePost} from '../triggers';
import { defaultSelector } from '../selectors';
import { addPreviewToPost } from '../lib/embedly';


class PostPage extends React.Component {
  componentDidMount() {
    PostPage.fetchData(this.props);
  }

  static async fetchData(props) {
    let client = new ApiClient(API_HOST)

    try {
      let result = await client.postInfo(props.params.uuid)
      getStore().dispatch(addPost(
        await addPreviewToPost(result)
      ));
    } catch (e) {
    }
  }

  render() {
    const post_uuid = this.props.params.uuid;

    if (!(post_uuid in this.props.posts)) {
      // not loaded yet
      return <script/>
    }

    const current_post = this.props.posts[post_uuid];

    if (current_post === false) {
      return <NotFound/>
    }

    const author = this.props.users[current_post.user_id]
    let triggers = {likePost, unlikePost};

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={this.props.current_user} />

        <div className="page__container">
          <div className="page__body">
            <div className="page__sidebar">
              <div className="layout__row">
                <CurrentUser user={this.props.current_user} />
              </div>

              <div className="layout__row">
                <a href="/">News feed</a>
              </div>
            </div>

            <div className="page__content">
              <PostWrapper author={author} current_user={this.props.current_user} post={current_post} showComments={true} triggers={triggers}>
                <ShortTextPost post={current_post}/>
              </PostWrapper>
            </div>
          </div>
        </div>

        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(PostPage);
