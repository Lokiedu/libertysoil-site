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
import _ from 'lodash';

import ApiClient from '../api/client'
import { API_HOST } from '../config';
import {getStore, addUser} from '../store';

import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar'
import { likePost, unlikePost, favPost, unfavPost } from '../triggers';
import { defaultSelector } from '../selectors';


class TagPage extends Component {
  static displayName = 'TagPage'

  componentDidMount() {
    TagPage.fetchData(this.props, new ApiClient(API_HOST));
  }

  static async fetchData(props, client) {
    try {
      let userInfo = client.userInfo(props.params.username);

      getStore().dispatch(addUser(await userInfo));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render() {
    const {
      is_logged_in,
      current_user
    } = this.props;
    let triggers = {likePost, unlikePost, favPost, unfavPost};

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user} />
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={this.props.current_user} />
            <div className="page__body_content">
              <div className="tag_header">
                Tag title...
              </div>
              <div className="page__content page__content-spacing">
                Posts here...
                <River river={this.props.river} posts={this.props.posts} users={this.props.users} current_user={this.props.current_user} triggers={triggers}/>
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
