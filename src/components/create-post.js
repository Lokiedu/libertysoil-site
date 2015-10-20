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

import postTypeConstants from '../consts/postTypeConstants';
import { EditPost } from './post';
import TagsEditor from './post/tags-editor';

export default class CreatePost extends React.Component {
  static displayName = 'CreatePost';
  static propTypes = {
    triggers: React.PropTypes.shape({
      createPost: React.PropTypes.func.isRequired
    })
  };

  submitHandler(event) {
    event.preventDefault();

    let form = event.target;

    this.props.triggers.createPost(
      'short_text',
      {
        text: form.text.value,
        tags: this.editor.getTags()
      }
    ).then(() => {
      form.text.value = '';
    });
  }

  switchPostType = () => {
    const postType = this.refs.postType.value;

    console.info('postType', postType);
  };

  render () {
    return (
      <div className="box box-post box-space_bottom">
        <form onSubmit={this.submitHandler.bind(this)}>
          <div className="box__body">
            <EditPost />

            <TagsEditor ref={(editor) => this.editor = editor} tags={[]} autocompleteTags={['tag1', 'tag2']} />

            <div className="layout__row layout layout-align_vertical">
              <div className="layout__grid_item layout__grid_item-wide">
                {false && <select ref="postType" className="input input-select" onChange={this.switchPostType}>
                  <option value={postTypeConstants.SHORT_TEXT}>Short text</option>
                  <option value={postTypeConstants.LONG_TEXT}>Long text</option>
                </select>}
              </div>

              <div className="layout__grid_item">
                <button className="button button-wide button-green" type="submit">Post</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
