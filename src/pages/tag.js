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

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import { getStore } from '../store';
import { setTagPosts } from '../actions';

import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar'
import { likePost, unlikePost, favPost, unfavPost } from '../triggers';
import { defaultSelector } from '../selectors';


class TagPage extends Component {
  static displayName = 'TagPage'

  static async fetchData(params, props, client) {
    try {
      let tagPosts = client.tagPosts(params.tag);

      getStore().dispatch(setTagPosts(params.tag, await tagPosts));
    } catch (e) {
      console.log(e);
      console.log(e.stack);
    }
  }

  render() {
    const {
      is_logged_in,
      current_user,
      posts,
      tag_posts,
      users
    } = this.props;
    const triggers = {likePost, unlikePost, favPost, unfavPost};
    const thisTagPosts = tag_posts[this.props.params.tag] || [];

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />

            <div className="page__body_content">
              <div className="tag_header">
                {this.props.params.tag}
              </div>

              <div className="page__content page__content-spacing">
                <River river={thisTagPosts} posts={posts} users={users} current_user={current_user} triggers={triggers}/>
                {/*<Followed/> */}
                {/*<Tags/>*/}
              </div>
            </div>
          </div>
        </div>

        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(TagPage);
