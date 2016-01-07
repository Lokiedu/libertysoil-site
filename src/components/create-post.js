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
import React, {PropTypes} from 'react';
import _ from 'lodash';

import postTypeConstants from '../consts/postTypeConstants';
import { EditPost } from './post';
import TagsEditor from './post/tags-editor';
import TagIcon from './tag-icon';
import MoreButton from './more-button';
import * as TagType from '../utils/tags';
import ClickOutsideComponentDecorator from '../decorators/ClickOutsideComponentDecorator';

import AddHashtagModal from './add-hashtag-modal';


@ClickOutsideComponentDecorator
export default class CreatePost extends React.Component {
  static displayName = 'CreatePost';
  static propTypes = {
    actions: PropTypes.shape({
      resetCreatePostForm: PropTypes.func,
      updateCreatePostForm: PropTypes.func
    }),
    defaultText: PropTypes.string,
    locations: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    tags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    triggers: PropTypes.shape({
      createPost: PropTypes.func.isRequired
    })
  };

  state = {
    expanded: false,
    addTagModalVisible: false
  };

  onClickOutside = () => {
    let form = this.refs.form;

    if (!form.text.value.trim().length) {
      this.setState({
        expanded: false
      });
    }
  };

  _handleSubmit = async (event) => {
    event.preventDefault();

    let form = this.refs.form;

    if (!form.text.value.trim().length) {
      return;
    }

    await this.props.triggers.createPost('short_text', {
      text: form.text.value,
      tags: this.props.tags.map(tag => tag.name)
    });

    form.text.value = '';
  };

  _handleFocus = () => {
    this.setState({
      expanded: true
    });
  };

  _handleClickOnMore = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  };

  _showAddHashtagModal = () => {
    this.setState({
      addTagModalVisible: true,
      addTagModalType: TagType.TAG_HASHTAG
    });
  };

  _showAddSchoolModal = () => {
    this.setState({
      addTagModalVisible: true,
      addTagModalType: TagType.TAG_SCHOOL
    });
  };

  _showAddLocationModal = () => {
    this.setState({
      addTagModalVisible: true,
      addTagModalType: TagType.TAG_LOCATION
    });
  };

  _closeAddTagModal = () => {
    this.setState({
      addTagModalVisible: false
    });
  };

  /**
   * Adds the tags to the redux form state.
   * Used in the tag modal.
   * @param {Object} tags - {tags: [], schools: [], locations: [], ...}
   */
  _addTags = (tags) => {
    this.props.actions.updateCreatePostForm(tags);

    this.setState({
      addTagModalVisible: false
    });
  };

  render () {
    let { addTagModalVisible, expanded } = this.state;

    return (
      <div className="box box-post box-space_bottom create_post">
        <form ref="form" onSubmit={this._handleSubmit}>
          <div className="box__body">
            <div className="layout__row layout layout-columns layout-align_start">
              <div className="layout__grid_item layout__grid_item-wide">
                <div className="create_post__text_input_wrapper">
                  {!expanded &&
                    <div className="create_post__caret"></div>
                  }
                  <textarea
                    className="input input-block create_post__text_input"
                    defaultValue={this.props.defaultText}
                    name="text"
                    placeholder="Make a contribution to education change"
                    rows={(this.state.expanded) ? 10 : 1}
                    onFocus={this._handleFocus}
                  />
                </div>
                {expanded &&
                  <div className="layout__row layout layout-align_vertical">
                    <div className="layout__grid_item">
                      <button className="button button-wide button-red" type="submit">Publish</button>
                    </div>
                    <div className="layout__grid_item">
                      <button className="button button-wide button-transparent" type="button">Go full screen</button>
                    </div>
                  </div>
                }
              </div>
              <div className="layout__grid_item layout__grid_item-small layout layout-rows layout-align_vertical">
                <MoreButton expanded={expanded} onClick={this._handleClickOnMore} />
                {expanded &&
                  <div className="layout layout-rows layout-align_vertical">
                    <TagIcon className="create_post__tag_button" type={TagType.TAG_SCHOOL} onClick={this._showAddSchoolModal} />
                    <TagIcon className="create_post__tag_button" type={TagType.TAG_LOCATION} onClick={this._showAddLocationModal}  />
                    {/*<TagIcon className="create_post__tag_button" type={TagType.TAG_EVENT} />*/}
                    {/*<TagIcon className="create_post__tag_button" type={TagType.TAG_MENTION} />*/}
                    <TagIcon className="create_post__tag_button" type={TagType.TAG_HASHTAG} onClick={this._showAddHashtagModal} />
                  </div>
                }
              </div>
            </div>
          </div>
        </form>
        {addTagModalVisible &&
          <AddHashtagModal
            locations={this.props.locations}
            schools={this.props.schools}
            tags={this.props.tags}
            onClose={this._closeAddTagModal}
            onSave={this._addTags}
          />
        }
      </div>
    )
  }
}
