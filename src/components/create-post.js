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
import ga from 'react-google-analytics';
import { form as inform, DisabledFormSubmit } from 'react-inform';

import { ArrayOfGeotags as ArrayOfGeotagsPropType } from '../prop-types/geotags';
import { ArrayOfHashtags as ArrayOfHashtagsPropType } from '../prop-types/hashtags';
import { ArrayOfSchools as ArrayOfSchoolsPropType } from '../prop-types/schools';
import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL } from '../consts/tags';
import ClickOutsideComponentDecorator from '../decorators/ClickOutsideComponentDecorator';

import TagIcon from './tag-icon';
import MoreButton from './more-button';
import AddTagModal from './add-tag-modal';

class CreatePost extends React.Component {
  static displayName = 'CreatePost';
  static propTypes = {
    actions: PropTypes.shape({
      resetCreatePostForm: PropTypes.func,
      updateCreatePostForm: PropTypes.func
    }),
    addedGeotags: ArrayOfGeotagsPropType,
    addedHashtags: ArrayOfHashtagsPropType,
    addedSchools: ArrayOfSchoolsPropType,
    fields: PropTypes.shape({
      minor_update: PropTypes.shape().isRequired,
      text: PropTypes.shape().isRequired
    }),
    form: PropTypes.shape({
      forceValidate: PropTypes.func.isRequired,
      isValid: PropTypes.func.isRequired,
      onValues: PropTypes.func.isRequired
    }).isRequired,
    triggers: PropTypes.shape({
      createPost: PropTypes.func.isRequired,
      loadUserRecentTags: PropTypes.func.isRequired,
      checkSchoolExists: PropTypes.func.isRequired,
      checkGeotagExists: PropTypes.func.isRequired
    }),
    userRecentTags: PropTypes.shape({
      geotags: ArrayOfGeotagsPropType.isRequired,
      schools: ArrayOfSchoolsPropType.isRequired,
      hashtags: ArrayOfHashtagsPropType.isRequired
    }).isRequired
  };

  constructor(props) {
    super(props);

    this.isSubmitting = false;
    this.state = {
      expanded: false,
      addTagModalType: null
    };
  }

  _stopPropagation = (e) => {
    if (e) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
  };

  onClickOutside = () => {
    const form = this.form;

    if (!form.text.value.trim().length) {
      this.setState({
        expanded: false
      });
    }
  };

  _handleSubmit = async (event) => {
    event.preventDefault();
    if (this.isSubmitting) {
      return;
    }

    const { fields, form } = this.props;

    if (!form.isValid()) {
      return;
    }

    this.isSubmitting = true;

    const data = {
      text: fields.text.value,
      hashtags: this.props.addedHashtags.map(hashtag => hashtag.get('name')).toJS(),
      schools: this.props.addedSchools.map(school => school.get('name')).toJS(),
      geotags: this.props.addedGeotags.map(geotag => geotag.get('id')).toJS(),
      minor_update: fields.minor_update.checked
    };

    this.props.actions.resetCreatePostForm();

    await this.props.triggers.createPost('short_text', data);
    ga('send', 'event', 'Post', 'Done', data.hashtags.join(','));
    await this.props.triggers.loadUserRecentTags();

    form.onValues({});
    await form.forceValidate();

    this._addTagModal.reset();
    this.isSubmitting = false;
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

  _handleKeydown = (e) => {
    const ENTER = 13;

    if (e.ctrlKey || e.metaKey) {
      if (e.keyCode === ENTER) {
        const submit = new Event('submit');
        this.form.dispatchEvent(submit);
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
    });
  };

  /**
   * @param {Object} tags - {hashtags: [], schools: [], geotags: [], ...}
   */
  _addTags = (tags) => {
    this.props.actions.updateCreatePostForm(tags);

    this._closeAddTagModal();
  };

  render() {
    const {
      form,
      fields
    } = this.props;
    const {
      addTagModalType,
      expanded
    } = this.state;

    const textProps = { ...fields.text };
    delete textProps.error;

    const minorUpdateProps = { ...fields.minor_update };
    delete minorUpdateProps.error;

    return (
      <div className="box box-post box-space_bottom create_post">
        <form ref={c => this.form = c} onKeyDown={this._handleKeydown} onSubmit={this._handleSubmit}>
          <div className="box__body">
            <div className="layout__row layout layout-columns layout-align_start">
              <div className="layout__grid_item layout__grid_item-wide">
                <div className="create_post__text_input_wrapper">
                  {!expanded &&
                    <div className="create_post__caret" />
                  }
                  <textarea
                    className="input input-block create_post__text_input"
                    name="text"
                    placeholder="Make a contribution to education change"
                    rows={expanded ? 10 : 1}
                    onFocus={this._handleFocus}
                    {...textProps}
                  />
                </div>
              </div>
              <div className="layout__grid_item layout__grid_item-small layout layout-rows layout-align_vertical">
                <MoreButton expanded={expanded} onClick={this._handleClickOnMore} />
                {expanded &&
                  <div className="layout layout-rows layout-align_vertical">
                    <TagIcon className="create_post__tag_button" type={TAG_SCHOOL} onClick={this._showAddSchoolModal} />
                    <TagIcon className="create_post__tag_button" type={TAG_LOCATION} onClick={this._showAddGeotagModal}  />
                    {/*<TagIcon className="create_post__tag_button" type={TAG_EVENT} />*/}
                    {/*<TagIcon className="create_post__tag_button" type={TAG_MENTION} />*/}
                    <TagIcon className="create_post__tag_button" type={TAG_HASHTAG} onClick={this._showAddHashtagModal} />
                  </div>
                }
              </div>
            </div>
            {expanded &&
              <div className="layout__row layout layout-align_vertical create_post__toolbar">
                <div className="layout__grid_item">
                  <DisabledFormSubmit
                    className="button button-wide button-red"
                    type="submit"
                    value="Publish"
                  />
                </div>
                <div className="layout__grid_item layout__grid_item-wide">
                  {/*<button className="button button-wide button-transparent" type="button">Go full screen</button>*/}
                </div>
                <div className="layout__grid_item layout__grid_item-small">
                  <label
                    className="action checkbox"
                    title="If you check this option, your subscribers won't see the post
                           on their feeds but will be able to see it on your page."
                  >
                    <span className="checkbox__label-left">Minor update (?)</span>
                    <input name="minor_update" type="checkbox" {...minorUpdateProps} />
                  </label>
                </div>
              </div>
            }
          </div>
        </form>
        <AddTagModal
          addedGeotags={this.props.addedGeotags}
          addedHashtags={this.props.addedHashtags}
          addedSchools={this.props.addedSchools}
          ref={(c) => this._addTagModal = c}
          triggers={this.props.triggers}
          type={addTagModalType}
          userRecentTags={this.props.userRecentTags}
          onClose={this._closeAddTagModal}
          onSave={this._addTags}
          onTypeChange={this._changeAddTagModal}
        />
      </div>
    );
  }
}

const fields = ['text', 'minor_update'];
const validate = values => {
  const { text } = values;
  const errors = {};

  if (!text || !text.trim().length) {
    errors.text = 'Post mustn\'t be empty';
  }

  return errors;
};

const DecoratedCreatePost = ClickOutsideComponentDecorator(CreatePost);
const WrappedCreatePost = inform({
  fields,
  validate
})(DecoratedCreatePost);

export default WrappedCreatePost;
