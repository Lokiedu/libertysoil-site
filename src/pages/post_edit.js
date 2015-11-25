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

import NotFound from './not-found'
import Header from '../components/header';
import Footer from '../components/footer';
import CurrentUser from '../components/current-user';
import {API_HOST} from '../config';
import ApiClient from '../api/client'
import {getStore, addPost, addError} from '../store';
import { URL_NAMES, getUrl } from '../utils/urlGenerator';
import {EditPost} from '../components/post'
import TagsEditor from '../components/post/tags-editor';
import Sidebar from '../components/sidebar';

import { defaultSelector } from '../selectors';
import { deletePost, updatePost } from '../triggers';

class PostEditPage extends React.Component {
  constructor (props) {
    super(props);

    this.submitHandler = this.submitHandler.bind(this);
    this.removeHandler = this.removeHandler.bind(this);
  }

  static async fetchData(params, props, client) {
    try {
      let result = await client.postInfo(params.uuid);
      getStore().dispatch(addPost(result));
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  }

  removeHandler(event) {
    event.preventDefault();

    if (confirm(`Are you sure you want to delete this post and all it's comments? There is no undo.`)) {
      deletePost(this.props.params.uuid)
        .then(() => {
          this.props.history.pushState(null, '/');
        }).catch(e => {
          console.log(e)
          console.log(e.stack)
        });
    }
  }

  submitHandler(event) {
    event.preventDefault();

    let form = event.target;

    updatePost(
      this.props.params.uuid,
      {
        text: form.text.value,
        tags: this.editor.getTags()
      }
    ).then((result) => {
      this.props.history.pushState(null, getUrl(URL_NAMES.POST, { uuid: result.id }));
    });
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

    if (current_post.user_id != this.props.current_user.id) {
      return <script/>;
    }

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={this.props.current_user} />
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={this.props.current_user}/>

            <div className="page__content">
              <div className="box box-post box-space_bottom">
                <form onSubmit={this.submitHandler} action="" method="post">
                  <input type="hidden" name="id" value={current_post.id} />

                  <div className="box__body">
                    <EditPost post={current_post}/>

                    <TagsEditor ref={(editor) => this.editor = editor} tags={current_post.labels} autocompleteTags={['tag1', 'tag2']} />

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

export default connect(defaultSelector)(PostEditPage);
