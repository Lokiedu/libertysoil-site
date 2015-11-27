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

import {API_HOST} from '../config';
import ApiClient from '../api/client'
import CreatePost from '../components/create-post'
import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar'
import { getStore } from '../store';
import { addError } from '../actions';
import { createPost, likePost, unlikePost, favPost, unfavPost, loadSchools } from '../triggers';
import { defaultSelector } from '../selectors';


class Index extends React.Component {

  // TODO(voidxnull): EnterHandler doesn't call the fetchData function for the component.
  componentDidMount() {
    Index.fetchData(this.props);
  }

  static async fetchData(props) {
    if (props.current_user_id === null) {
      return;
    }

    try {
      if (getStore().getState().get('schools').isEmpty()) {
        await loadSchools();
      }
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }

  }

  render() {
    let triggers = {likePost, unlikePost, favPost, unfavPost};

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={this.props.current_user} />
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={this.props.current_user} />

            <div className="page__content">
              <CreatePost triggers={{createPost}} schools={this.props.schools} />
              <River river={this.props.river} posts={this.props.posts} users={this.props.users} current_user={this.props.current_user} triggers={triggers}/>
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

export default connect(defaultSelector)(Index);
