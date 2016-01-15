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
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {API_HOST} from '../config';
import ApiClient from '../api/client'
import CreatePost from '../components/create-post'
import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Sidebar from '../components/sidebar';
import SidebarAlt from '../components/sidebarAlt';
import AddedTags from '../components/post/added-tags';
import { ActionsTrigger } from '../triggers';
import { defaultSelector } from '../selectors';
import {
  resetCreatePostForm,
  updateCreatePostForm
} from '../actions';


class List extends React.Component {
  static displayName = 'List';

  static async fetchData(params, store, client) {
    let trigger = new ActionsTrigger(client, store.dispatch);

    await Promise.all([
      trigger.loadSchools(),
      trigger.loadPostRiver()
    ]);
  }

  render() {
    const { resetCreatePostForm, updateCreatePostForm } = this.props;
    const actions = {resetCreatePostForm, updateCreatePostForm};
    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={this.props.current_user} />
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={this.props.current_user} />
            <div className="page__content">
              <CreatePost
                actions={actions}
                allSchools={_.values(this.props.schools)}
                defaultText={this.props.create_post_form.text}
                triggers={triggers}
                {...this.props.create_post_form}
              />
              <River river={this.props.river} posts={this.props.posts} users={this.props.users} current_user={this.props.current_user} triggers={triggers}/>
              {/*<Followed/> */}
              {/*<Tags/>*/}
            </div>
            <SidebarAlt>
              <AddedTags {...this.props.create_post_form} />
            </SidebarAlt>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

export default connect(defaultSelector, dispatch => ({
  dispatch,
  ...bindActionCreators({resetCreatePostForm, updateCreatePostForm}, dispatch)
}))(List);
