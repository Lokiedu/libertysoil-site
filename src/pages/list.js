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

import CreatePost from '../components/create-post'
import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar'
import {createPost, likePost, unlikePost} from '../triggers';


class Index extends React.Component {
  render() {
    let current_user;
    if (this.props.is_logged_in) {
      current_user = _.cloneDeep(this.props.users[this.props.current_user]);
      current_user.likes = this.props.likes[this.props.current_user];
      current_user.favourites = this.props.favourites[this.props.current_user];
    }

    let triggers = {likePost, unlikePost};

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={current_user} />
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />

            <div className="page__content">
              <CreatePost triggers={{createPost}}/>
              <River river={this.props.river} posts={this.props.posts} users={this.props.users} current_user={current_user} triggers={triggers}/>
              {/*<Followed/> */}
              {/*<Tags/>*/}
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

function select(state) {
  return state.toJS();
}

export default connect(select)(Index);
