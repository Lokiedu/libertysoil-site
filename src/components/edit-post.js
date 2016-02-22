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

import TagIcon from './tag-icon';
import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL } from '../consts/tags';
import AddTagModal from './add-tag-modal';


export default class EditPost extends React.Component {
  static displayName = 'EditPost';

  static propTypes = {
    actions: PropTypes.shape({
      resetEditPostForm: PropTypes.func,
      updateEditPostForm: PropTypes.func
    }),
    allSchools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    geotags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })),
    id: PropTypes.string,
    onDelete: PropTypes.func,
    onSubmit: PropTypes.func,
    post: PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string,
      geotags: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string
      })),
      schools: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string
      })),
      labels: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string
      }))
    }),
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    tags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    triggers: PropTypes.shape({
      updatePost: PropTypes.func.isRequired,
      deletePost: PropTypes.func.isRequired
    })
  };

  constructor(props) {
    super(props);

    this.state = {
      addTagModalType: null
    };
  }

  componentWillMount() {
    let newFormState = {
      id: this.props.post.id,
      geotags: this.props.post.geotags,
      schools: this.props.post.schools,
      tags: this.props.post.labels
    };

    this.props.actions.updateEditPostForm(newFormState);
  }

  componentWillUnmount() {
    this.props.actions.resetEditPostForm();
  }

  _stopPropagation = (e) => {
    if (e) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
  };

  _handleSubmit = async (event) => {
    event.preventDefault();

    let form = this.refs.form;

    if (!form.text.value.trim().length) {
      return;
    }

    let data = {
      text: form.text.value,
      tags: this.props.tags.map(tag => tag.name),
      schools: this.props.schools.map(school => school.name),
      geotags: this.props.geotags.map(geotag => geotag.id),
      minor_update: (form.minor_update) ? form.minor_update.checked : null
    };

    await this.props.triggers.updatePost(this.props.post.id, data);

    this.props.onSubmit(event);

    this.props.actions.resetEditPostForm();
  };

  _handleDelete = async (event) => {
    if (confirm(`Are you sure you want to delete this post and all it's comments? There is no undo.`)) {
      try {
        await this.props.triggers.deletePost(this.props.post.id);
        this.props.onDelete(event);
      } catch (e) {
        // do nothing. redux already had got an error
      }
    }
  };

  _showAddHashtagModal = (e) => {
    this._stopPropagation(e);

    this.setState({
      addTagModalType: TAG_HASHTAG
    });
  };

  _showAddSchoolModal = (e) => {
    this._stopPropagation(e);

    this.setState({
      addTagModalType: TAG_SCHOOL
    });
  };

  _showAddGeotagModal = (e) => {
    this._stopPropagation(e);

    this.setState({
      addTagModalType: TAG_LOCATION
    });
  };

  _closeAddTagModal = (e) => {
    this._stopPropagation(e);

    this.setState({
      addTagModalType: null
    });
  };

  _changeAddTagModal = (newType) => {
    this.setState({
      addTagModalType: newType
    })
  };

  /**
   * @param {Object} tags - {tags: [], schools: [], geotags: [], ...}
   */
  _addTags = (tags) => {
    this.props.actions.updateEditPostForm(tags);

    this._closeAddTagModal();
  };

  render () {
    let {
      allSchools,
      post
    } = this.props;

    let {
      addTagModalType
    } = this.state;

    let allModalTags = _.pick(this.props, 'geotags', 'schools', 'tags');

    // If edit_post_form is not initialized yet.
    if (!this.props.id) {
      allModalTags = {
        geotags: post.geotags,
        schools: post.schools,
        tags: post.labels
      }
    }

    return (
      <div className="box box-post box-space_bottom create_post">
        <form ref="form" onSubmit={this._handleSubmit}>
          <input type="hidden" name="id" value={post.id} />
          <div className="box__body">
            <div className="layout__row layout layout-columns layout-align_start">
              <div className="layout__grid_item layout__grid_item-wide">
                <div className="create_post__text_input_wrapper">
                  <textarea
                    className="input input-block create_post__text_input"
                    defaultValue={post.text}
                    name="text"
                    placeholder="Make a contribution to education change"
                    rows={10}
                  />
                </div>
              </div>
              <div className="layout__grid_item layout__grid_item-small layout layout-rows layout-align_vertical">
                <div className="layout layout-rows layout-align_vertical">
                  <TagIcon className="create_post__tag_button" type={TAG_SCHOOL} onClick={this._showAddSchoolModal} />
                  <TagIcon className="create_post__tag_button" type={TAG_LOCATION} onClick={this._showAddGeotagModal}  />
                  {/*<TagIcon className="create_post__tag_button" type={TAG_EVENT} />*/}
                  {/*<TagIcon className="create_post__tag_button" type={TAG_MENTION} />*/}
                  <TagIcon className="create_post__tag_button" type={TAG_HASHTAG} onClick={this._showAddHashtagModal} />
                </div>
              </div>
            </div>
            <div className="layout__row layout layout-align_vertical">
              <div className="layout layout__grid layout__grid_item-wide">
                <button className="button button-wide button-red" type="submit">Save</button>
                <button className="button button-red" type="button" onClick={this._handleDelete}>
                  <span className="fa fa-trash-o" />
                </button>
                {/*<button className="button button-wide button-transparent" type="button">Go full screen</button>*/}
              </div>
              <div className="layout__grid_item layout__grid_item-small">
                {!post.fully_published_at &&
                  <label
                    className="action checkbox"
                    title="If you uncheck this option, the post will show up on
                           your subscribers' feeds as if you've just posted it."
                  >
                    <span className="checkbox__label-left">Minor update (?)</span>
                    <input defaultChecked name="minor_update" type="checkbox" />
                  </label>
                }
              </div>
            </div>
          </div>
        </form>
        <AddTagModal
          allSchools={allSchools}
          ref={(c) => this._addTagModal = c}
          type={addTagModalType}
          onClose={this._closeAddTagModal}
          onSave={this._addTags}
          onTypeChange={this._changeAddTagModal}
          {...allModalTags}
        />
      </div>
    )
  }
}
