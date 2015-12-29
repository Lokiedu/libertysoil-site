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

import postTypeConstants from '../consts/postTypeConstants';
import { EditPost } from './post';
import TagsEditor from './post/tags-editor';
import TagIcon from './tag-icon';
import MoreButton from './more-button';
import * as TagType from '../utils/tags';

export default class CreatePost extends React.Component {
  static displayName = 'CreatePost';
  static propTypes = {
    schools: React.PropTypes.object,
    triggers: React.PropTypes.shape({
      createPost: React.PropTypes.func.isRequired
    })
  };

  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
      expandedViaMore: false
    }
  }

  _handleSubmit = async (event) => {
    event.preventDefault();

    let form = event.target;

    if (form.text.value.trim().length === 0) {
      return;
    }

    // TODO: Add tags
    await this.props.triggers.createPost('short_text', {
      text: form.text.value
    });

    form.text.value = '';

  };

  _handleFocus = () => {
    this.setState({
      expanded: true
    });
  };

  _handleBlur = (event) => {
    if (event.target.value.trim().length === 0 &&
        !this.state.expandedViaMore) {
      this.setState({
        expanded: false
      });
    }
  };

  _handleClickOnMore = () => {
    this.setState({
      expanded: !this.state.expanded,
      expandedViaMore: !this.state.expanded
    });
  };

  /**
   * Renders a textarea with artificial caret.
   * @private
   */
  _renderTextarea() {
    return (
      <div className="create_post__text_input_wrapper">
        {(!this.state.expanded) ? <div className="create_post__caret"></div> : null}
        <textarea
          className="input input-block create_post__text_input"
          name="text"
          placeholder="Make a contribution to education change"
          rows={(this.state.expanded) ? 10 : 1}
          onBlur={this._handleBlur}
          onFocus={this._handleFocus}
        />
      </div>
    );
  }

  _renderTagButtons() {
    if (this.state.expanded) {
      return (
        <div className="layout layout-rows layout-align_vertical">
          <TagIcon className="create_post__tag_button" type={TagType.TAG_SCHOOL} />
          <TagIcon className="create_post__tag_button" type={TagType.TAG_LOCATION} />
          <TagIcon className="create_post__tag_button" type={TagType.TAG_EVENT} />
          <TagIcon className="create_post__tag_button" type={TagType.TAG_MENTION} />
          <TagIcon className="create_post__tag_button" type={TagType.TAG_HASHTAG} />
        </div>
      );
    }
  }

  _renderFooter() {
    if (this.state.expanded) {
      return (
        <div className="layout__row layout layout-align_vertical">
          <div className="layout__grid_item">
            <button className="button button-wide button-red" type="submit">Publish</button>
          </div>
          <div className="layout__grid_item">
            <button className="button button-wide button-transparent" type="button">Go full screen</button>
          </div>
        </div>
      );
    }
  }

  render () {
    return (
      <div className="box box-post box-space_bottom create_post">
        <form onSubmit={this._handleSubmit}>
          <div className="box__body">
            <div className="layout__row layout layout-columns layout-align_start">
              <div className="layout__grid_item layout__grid_item-wide">
                {this._renderTextarea()}
                {this._renderFooter()}
              </div>
              <div className="layout__grid_item layout__grid_item-small layout layout-rows layout-align_vertical">
                <MoreButton expanded={this.state.expanded} onClick={this._handleClickOnMore} />
                {this._renderTagButtons()}
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
