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
import request from 'superagent';
import _ from 'lodash';

import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Followed from '../components/most_followed_people';
import Tags from '../components/popular_tags';
import Sidebar from '../components/sidebar'
import {API_HOST} from '../config';
import {getStore, setPostsToRiver} from '../store';


class Index extends React.Component {
  async componentWillMount() {
    let result = await request.get(`${API_HOST}/api/v1/posts`);
    getStore().dispatch(setPostsToRiver(result.body));
  }
  render() {
    let current_user = _.cloneDeep(this.props.users[this.props.current_user]);
    current_user.likes = this.props.likes[this.props.current_user];

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={current_user} />
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />

            <div className="page__content">
              <River river={this.props.river} posts={this.props.posts} users={this.props.users} current_user={current_user}/>
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
