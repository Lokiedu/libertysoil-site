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
import {API_HOST} from '../config';
import ApiClient from '../api/client'
import {getStore, addPost, removePost, addError} from '../store';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import {EditPost} from '../components/post'


class PostEditPage extends React.Component {
  constructor (props) {
    super(props);

    this.submitHandler = this.submitHandler.bind(this);
    this.removeHandler = this.removeHandler.bind(this);
  }

  async componentWillMount() {
    let client = new ApiClient(API_HOST)
    try {
      let result = await client.postInfo(this.props.params.uuid);
      getStore().dispatch(addPost(result));
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  }

  async removeHandler(event) {
    event.preventDefault();

    if (confirm(`Are you sure you want to delete this post and all it's comments? There is no undo.`)) {
      let client = new ApiClient(API_HOST)
      try {
        let result = await client.deletePost(this.props.params.uuid)
        getStore().dispatch(removePost(this.props.params.uuid));
        this.props.history.pushState(null, '/');
      } catch (e) {
      }
    }
  }

  async submitHandler(event) {
    event.preventDefault();

    let form = event.target;
    let client = new ApiClient(API_HOST)

    try {
      let result = await client.updatePost(this.props.params.uuid, {text: form.text.value});
      getStore().dispatch(addPost(result));
      this.props.history.pushState(null, getUrl(URL_NAMES.POST, { uuid: result.id }));
    } catch (e) {
      getStore().dispatch(addError(e.message));
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


    let current_user;

    if (this.props.is_logged_in) {
      current_user = _.cloneDeep(this.props.users[this.props.current_user]);
      current_user.likes = this.props.likes[this.props.current_user];
    }

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={current_user} />
        <div className="page__container">
          <div className="page__body">
            <div className="page__sidebar">
              <div className="layout__row">
                <CurrentUser user={current_user} />
              </div>
            </div>

            <div className="page__content">
              <div className="box box-post box-space_bottom">
                <form onSubmit={this.submitHandler} action="" method="post">
                  <input type="hidden" name="id" value={current_post.id} />

                  <div className="box__body">
                    <EditPost post={current_post}/>

                    <div className="layout__row">
                      <div className="layout layout__grid layout-align_right">
                        <button className="button button-red" type="button" onClick={this.removeHandler}><span className="fa fa-trash-o"></span></button>
                        <button className="button button-wide button-green" type="submit">Save</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
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

export default connect(select)(PostEditPage);
