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

import Button from './button';
import TagIcon from './tag-icon';
import MoreButton from './more-button';
import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL } from '../consts/tags';
import ClickOutsideComponentDecorator from '../decorators/ClickOutsideComponentDecorator';
import AddTagModal from './add-tag-modal';


class CreatePost extends React.Component {
  static displayName = 'CreatePost';
  static propTypes = {
    actions: PropTypes.shape({
      resetCreatePostForm: PropTypes.func,
      updateCreatePostForm: PropTypes.func
    }),
    allSchools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    defaultText: PropTypes.string,
    geotags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })),
    hashtags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    triggers: PropTypes.shape({
      createPost: PropTypes.func.isRequired,
      loadUserRecentTags: PropTypes.func.isRequired,
      checkSchoolExists: PropTypes.func.isRequired,
      checkGeotagExists: PropTypes.func.isRequired
    }),
    userRecentTags: PropTypes.shape({
      geotags: PropTypes.array.isRequired,
      schools: PropTypes.array.isRequired,
      hashtags: PropTypes.array.isRequired
    }).isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      isSubmitting: false,
      hasText: false,
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
    if (this.state.isSubmitting) {
      return;
    }

    if (!this.state.hasText) {
      return;
    }

    this.setState({ isSubmitting: true });

    const form = this.form;
    const data = {
      text: form.text.value,
      hashtags: this.props.hashtags.map(hashtag => hashtag.name),
      schools: this.props.schools.map(school => school.name),
      geotags: this.props.geotags.map(geotag => geotag.id),
      minor_update: form.minor_update.checked
    };

    this.props.actions.resetCreatePostForm();

    await this.props.triggers.createPost('short_text', data);
    ga('send', 'event', 'Post', 'Done', data.hashtags.join(','));
    await this.props.triggers.loadUserRecentTags();

    form.text.value = '';
    this._addTagModal.reset();
    this.setState({ isSubmitting: false, hasText: false });
  };

  _handleTextChange = (event) => {
    let hasText = false;
    if (event.target.value.trim()) {
      hasText = true;
    }

    this.setState({ hasText });
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
      addTagModalType,
      expanded
    } = this.state;

    return (
      <div className="box box-post box-space_bottom create_post">
        <form ref={c => this.form = c} onKeyDown={this._handleKeydown} onSubmit={this._handleSubmit}>
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
                    onChange={this._handleTextChange}
                    onFocus={this._handleFocus}
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
              <div className="layout__row layout layout-align_vertical">
                <div className="layout__grid_item">
                  <Button
                    className="button button-wide button-red"
                    disabled={!this.state.hasText}
                    title="Publish"
                    type="submit"
                    waiting={this.state.isSubmitting}
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
                    <input name="minor_update" type="checkbox" />
                  </label>
                </div>
              </div>
            }
          </div>
        </form>
        <AddTagModal
          allSchools={this.props.allSchools}
          geotags={this.props.geotags}
          hashtags={this.props.hashtags}
          ref={(c) => this._addTagModal = c}
          schools={this.props.schools}
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

const DecoratedCreatePost = ClickOutsideComponentDecorator(CreatePost);
export default DecoratedCreatePost;
