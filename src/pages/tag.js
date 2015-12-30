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
import { setTagPosts } from '../actions';
import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import FollowTagButton from '../components/follow-tag-button';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';

export class TagPage extends Component {
  static displayName = 'TagPage'

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
      users
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    const thisTagPosts = tag_posts[this.props.params.tag] || [];
    const followedTags = (current_user) ? current_user.followed_tags : [];

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />

            <div className="page__body_content">
              <div className="tag_header">
                <div className="layout__grid">
                  <div className="layout__grid_item layout__grid_item-wide">
                    {this.props.params.tag}
                  </div>
                  <div className="layout__grid_item layout__grid_item-small">
                    <FollowTagButton
                      current_user={current_user}
                      followed_tags={followedTags}
                      tag={this.props.params.tag}
                      triggers={triggers}
                    />
                  </div>
                </div>
              </div>
              <div className="page__content page__content-spacing">
                <River river={thisTagPosts} posts={posts} users={users} current_user={current_user} triggers={triggers}/>
                {/*<Followed/> */}
                {/*<Tags/>*/}
              </div>
            </div>
            <SidebarAlt />
          </div>
        </div>

        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector)(TagPage);
