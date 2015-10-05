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
import React from 'react'

import {API_HOST} from '../config'
import ApiClient from '../api/client'
import {getStore, addError, addPostToRiver} from '../store';

export class CreatePost extends React.Component {
  async submitHandler(event) {
    event.preventDefault();

    let form = event.target;
    let client = new ApiClient(API_HOST)

    try {
      let result = await client.createPost(form.text.value)
      form.text.value = '';

      getStore().dispatch(addPostToRiver(result));
    } catch (e) {
      console.log(e)
      console.log(e.stack)
      getStore().dispatch(addError(e.message));
    }
  }

  render() {
    return (
      <div className="box box-post box-space_bottom">
        <form onSubmit={this.submitHandler} action="" method="post">
          <div className="box__body">
            <div className="layout__row">
              <textarea className="input input-textarea input-block" placeholder="Share some knowledge" name="text" />
            </div>
            <div className="layout__row layout layout-align_right">
              <button className="button button-wide button-green" type="submit">Post</button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
