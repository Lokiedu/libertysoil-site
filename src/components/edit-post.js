/*
 This file is a part of libertysoil.org website
 Copyright (C) 2016  Loki Education (Social Enterprise)

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
import React, { PropTypes } from 'react';
import { pick } from 'lodash';

import { ArrayOfGeotags as ArrayOfGeotagsPropType } from '../prop-types/geotags';
import { ArrayOfHashtags as ArrayOfHashtagsPropType } from '../prop-types/hashtags';
import {
  ArrayOfSchools as ArrayOfSchoolsPropType,
  ArrayOfLightSchools as ArrayOfLightSchoolsPropType
} from '../prop-types/schools';
import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL } from '../consts/tags';

import Button from './button';
import Tag from './tag';
import AddTagModal from './add-tag-modal';

export default class EditPost extends React.Component {
  static displayName = 'EditPost';

  static propTypes = {
    actions: PropTypes.shape({
      resetEditPostForm: PropTypes.func,
      updateEditPostForm: PropTypes.func
    }),
    geotags: ArrayOfGeotagsPropType,
    hashtags: ArrayOfHashtagsPropType,
    id: PropTypes.string,
    onDelete: PropTypes.func,
    onSubmit: PropTypes.func,
    post: PropTypes.shape({
      geotags: ArrayOfGeotagsPropType,
      hashtags: ArrayOfHashtagsPropType,
      id: PropTypes.string.isRequired,
      schools: ArrayOfLightSchoolsPropType,
      text: PropTypes.string
    }),
    schools: ArrayOfLightSchoolsPropType,
    triggers: PropTypes.shape({
      updatePost: PropTypes.func.isRequired,
      deletePost: PropTypes.func.isRequired,
      loadUserRecentTags: PropTypes.func.isRequired,
      checkSchoolExists: PropTypes.func.isRequired,
      checkGeotagExists: PropTypes.func.isRequired
    }),
    userRecentTags: PropTypes.shape({
      geotags: ArrayOfGeotagsPropType.isRequired,
      hashtags: ArrayOfHashtagsPropType.isRequired,
      schools: ArrayOfSchoolsPropType.isRequired
    }).isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      isSubmitting: false,
      hasText: false,
      addTagModalType: null,
      upToDate: false
    };
  }

  componentWillMount() {
    const { post } = this.props;
    const upToDate = this.update(post, this.props.id);

    if (!upToDate) {
      const newFormState = {
        id: post.get('id'),
        geotags: post.get('geotags').toJS(),
        schools: post.get('schools').toJS(),
        hashtags: post.get('hashtags').toJS()
      };

      this.props.actions.updateEditPostForm(newFormState);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.upToDate) {
      this.update(nextProps.post, nextProps.id);
    }
  }

  componentWillUnmount() {
    this.props.actions.resetEditPostForm();
  }

  update = (post, formPostId) => {
    if (post.get('id') === formPostId) {
      let hasText = false;
      if (post.get('text').trim()) {
        hasText = true;
      }

      this.setState({ upToDate: true, hasText });
      return true;
    }

    return false;
  };

  _handleTextChange = (event) => {
    let hasText = false;
    if (event.target.value.trim()) {
      hasText = true;
    }

    this.setState({ hasText });
  };

  _handleSubmit = async (event) => {
    event.preventDefault();

    if (!this.state.hasText) {
      return;
    }

    this.setState({ isSubmitting: true });

    const form = this.form;
    const data = {
      text_source: form.text.value,
      hashtags: this.props.hashtags.map(hashtag => hashtag.get('name')).toJS(),
      schools: this.props.schools.map(school => school.get('name')).toJS(),
      geotags: this.props.geotags.map(geotag => geotag.get('id')).toJS(),
      minor_update: (form.minor_update) ? form.minor_update.checked : null
    };

    await this.props.triggers.updatePost(this.props.post.get('id'), data);
    await this.props.triggers.loadUserRecentTags();

    this.props.actions.resetEditPostForm();
    this.setState({ isSubmitting: false });
    this.props.onSubmit(event);
  };

  _handleKeydown = (e) => {
    const ENTER = 13;

    if (e.ctrlKey || e.metaKey) {
      if (e.keyCode === ENTER) {
        const submit = new Event('submit');
        this.form.dispatchEvent(submit);
      }
    }
  };

  _handleDelete = async (event) => {
    if (confirm(`Are you sure you want to delete this post and all it's comments? There is no undo.`)) {
      try {
        await this.props.triggers.deletePost(this.props.post.get('id'));
        this.props.onDelete(event);
      } catch (e) {
        // do nothing. redux already had got an error
      }
    }
  };

  _showAddHashtagModal = () => {
    this.setState({
      addTagModalType: TAG_HASHTAG
    });
  };

  _showAddSchoolModal = () => {
    this.setState({
      addTagModalType: TAG_SCHOOL
    });
  };

  _showAddGeotagModal = () => {
    this.setState({
      addTagModalType: TAG_LOCATION
    });
  };

  _closeAddTagModal = () => {
    this.setState({
      addTagModalType: null
    });
  };

  _changeAddTagModal = (tag) => {
    this.setState({
      addTagModalType: tag.type
    });
  };

  /**
   * @param {Object} tags - {hashtags: [], schools: [], geotags: [], ...}
   */
  _addTags = (tags) => {
    this.props.actions.updateEditPostForm(tags);

    this._closeAddTagModal();
  };

  render() {
    const {
      post
    } = this.props;

    const {
      addTagModalType
    } = this.state;

    let allModalTags = pick(this.props, 'geotags', 'schools', 'hashtags');

    // If edit_post_form is not initialized yet.
    if (this.props.id) {
      allModalTags = {
        addedGeotags: this.props.geotags,
        addedHashtags: this.props.hashtags,
        addedSchools: this.props.schools
      };
    } else {
      allModalTags = {
        addedGeotags: post.get('geotags'),
        addedHashtags: post.get('hashtags'),
        addedSchools: post.get('schools')
      };
    }

    return (
      <div className="box box-post box-space_bottom create_post">
        <form ref={c => this.form = c} onKeyDown={this._handleKeydown} onSubmit={this._handleSubmit}>
          <input name="id" type="hidden" value={post.get('id')} />
          <div className="box__body">
            <div className="layout__row layout layout-columns layout-align_start">
              <div className="layout__grid_item layout__grid_item-wide">
                <div className="create_post__text_input_wrapper">
                  <textarea
                    className="input input-block create_post__text_input"
                    defaultValue={post.get('text')}
                    name="text"
                    placeholder="Make a contribution to education change"
                    rows={10}
                    onChange={this._handleTextChange}
                  />
                </div>
              </div>
              <div className="layout__grid_item layout__grid_item-small layout layout-rows layout-align_vertical">
                <div className="layout layout-rows layout-align_vertical">
                  <div className="layout layout-rows layout-align_vertical">
                    <Tag
                      className="create_post__tag_button"
                      collapsed
                      isLink={false}
                      type={TAG_SCHOOL}
                      onClick={this._showAddSchoolModal}
                    />
                    <Tag
                      className="create_post__tag_button"
                      collapsed
                      isLink={false}
                      type={TAG_LOCATION}
                      onClick={this._showAddGeotagModal}
                    />
                    {/* TAG_EVENT */}
                    {/* TAG_MENTION */}
                    <Tag
                      className="create_post__tag_button"
                      collapsed
                      isLink={false}
                      type={TAG_HASHTAG}
                      onClick={this._showAddHashtagModal}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="layout__row layout layout-align_vertical">
              <div className="layout layout__grid layout__grid_item-wide">
                <Button
                  className="button button-wide button-red"
                  disabled={!this.state.hasText}
                  title="Save"
                  type="submit"
                  waiting={this.state.isSubmitting}
                />
                <button className="button button-red" type="button" onClick={this._handleDelete}>
                  <span className="fa fa-trash-o" />
                </button>
                {/*<button className="button button-wide button-transparent" type="button">Go full screen</button>*/}
              </div>
              <div className="layout__grid_item layout__grid_item-small">
                {!post.get('fully_published_at') &&
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
        {this.state.upToDate &&
          <AddTagModal
            ref={(c) => this._addTagModal = c}
            triggers={this.props.triggers}
            type={addTagModalType}
            userRecentTags={this.props.userRecentTags}
            onClose={this._closeAddTagModal}
            onSave={this._addTags}
            onTypeChange={this._changeAddTagModal}
            {...allModalTags}
          />
        }
      </div>
    );
  }
}
