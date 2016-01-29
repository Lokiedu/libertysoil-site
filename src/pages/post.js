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
import { connect } from 'react-redux';

import NotFound from './not-found'
import Header from '../components/header';
import Footer from '../components/footer';
import { ShortTextPost, PostWrapper } from '../components/post'
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import {API_HOST} from '../config';
import ApiClient from '../api/client'
import { addPost } from '../actions';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import { Post } from '../api/db';


export class PostPage extends React.Component {

  static propTypes = {
    params: PropTypes.shape({
      uuid: PropTypes.string.isRequired
    }).isRequired,
    posts: PropTypes.arrayOf(Post).isRequired
  };

  static async fetchData(params, store, client) {
    let result = await client.postInfo(params.uuid)
    store.dispatch(addPost(result));
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

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={this.props.current_user} />

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={this.props.current_user}/>

            <div className="page__content">
              <PostWrapper author={author} current_user={this.props.current_user} post={current_post} showComments={true} triggers={triggers}>
                <ShortTextPost post={current_post}/>
              </PostWrapper>
            </div>

            <SidebarAlt />
          </div>
        </div>

        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(PostPage);
