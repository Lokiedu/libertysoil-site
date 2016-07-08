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
import React, { PropTypes, Component } from 'react';
import { clone, differenceWith, pick, remove } from 'lodash';

import { ArrayOfGeotagsPropType } from './deps';
import { ArrayOfHashtagsPropType } from './deps';

import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL, IMPLEMENTED_TAGS } from './deps';
import { ModalComponent } from './deps';
import { TagCloud } from './deps';

import ModalSwitcher from './switcher';
import AddTagForm from './form';

function AddedTags({ addedTags, onDelete }) {
  if (!addedTags.geotags.length &&
      !addedTags.schools.length &&
      !addedTags.hashtags.length) {
    return null;
  }

  return (
    <div className="layout__row">
      <div className="layout__row">
        Added:
      </div>
      <div className="layout__row add_tag_modal__added_tags">
        <TagCloud
          deletable
          onDelete={onDelete}
          {...addedTags}
        />
      </div>
    </div>
  );
}

function Heading({ type }) {
  let text;

  switch (type) {
    case TAG_HASHTAG:
      text = 'Add hashtags to your post'; break;
    case TAG_SCHOOL:
      text = 'Add schools to your post'; break;
    case TAG_LOCATION:
      text = 'Add locations to your post'; break;
  }

  return <ModalComponent.Title>{text}</ModalComponent.Title>;
}

export default class AddTagModal extends Component {
  static displayName = 'AddTagModal';

  static propTypes = {
    allSchools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })).isRequired,
    geotags: ArrayOfGeotagsPropType,
    hashtags: ArrayOfHashtagsPropType,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    onTypeChange: PropTypes.func,
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    triggers: PropTypes.shape({
      checkSchoolExists: PropTypes.func.isRequired,
      checkGeotagExists: PropTypes.func.isRequired
    }),
    type: PropTypes.oneOf(IMPLEMENTED_TAGS),
    userRecentTags: PropTypes.shape({
      geotags: ArrayOfGeotagsPropType.isRequired,
      schools: PropTypes.array.isRequired,
      hashtags: ArrayOfHashtagsPropType.isRequired
    }).isRequired
  };

  static defaultProps = {
    geotags: [],
    schools: [],
    hashtags: [],
    onClose: () => {},
    onSave: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      geotags: clone(this.props.geotags),
      schools: clone(this.props.schools),
      hashtags: clone(this.props.hashtags)
    };
  }

  reset = () => {
    this.setState({
      geotags: clone(this.props.geotags),
      schools: clone(this.props.schools),
      hashtags: clone(this.props.hashtags)
    });
  };

  _save = () => {
    this.props.onSave(pick(this.state, 'geotags', 'schools', 'hashtags'));
  };

  _addGeotag = (geotag) => {
    const state = pick(this.state, 'geotags');

    state.geotags.push(geotag);

    this.setState(state);
  };

  _addSchool = (school) => {
    const state = pick(this.state, 'schools');

    state.schools.push(school);

    this.setState(state);
  };

  _addHashtag = (tag) => {
    const state = pick(this.state, 'hashtags');

    state.hashtags.push(tag);

    this.setState(state);
  };

  _deleteTag = (displayTag) => {
    const state = clone(this.state);

    switch (displayTag.type) {
      case TAG_LOCATION: {
        remove(state.geotags, geotag => geotag.url_name === displayTag.urlId);

        break;
      }
      case TAG_SCHOOL: {
        remove(state.schools, school => school.url_name === displayTag.urlId);

        break;
      }
      case TAG_HASHTAG: {
        remove(state.hashtags, hashtag => hashtag.name === displayTag.urlId);

        break;
      }
    }

    this.setState(state);
  };

  _handleClose = (event) => {
    this.reset();
    this.props.onClose(event);
  };

  render() {
    const {
      allSchools,
      type,
      onTypeChange
    } = this.props;

    if (!type) {
      return null;
    }

    const recentGeotags = differenceWith(
      this.props.userRecentTags.geotags, this.state.geotags, (a, b) => a.name === b.name);
    const recentSchools = differenceWith(
      this.props.userRecentTags.schools, this.state.schools, (a, b) => a.name === b.name);
    const recentHashtags = differenceWith(
      this.props.userRecentTags.hashtags, this.state.hashtags, (a, b) => a.name === b.name);
    const userRecentTags = { geotags: recentGeotags, schools: recentSchools, hashtags: recentHashtags };

    return (
      <ModalComponent
        size="normal"
        onHide={this._handleClose}
      >
        <ModalComponent.Head>
          <Heading type={type} />
          <ModalSwitcher
            activeType={type}
            onClose={this._handleClose}
            onTypeChange={onTypeChange}
          />
        </ModalComponent.Head>
        <ModalComponent.Body>
          <AddTagForm
            addedTags={this.state}
            allSchools={allSchools}
            triggers={this.props.triggers}
            type={type}
            userRecentTags={userRecentTags}
            onAddGeotag={this._addGeotag}
            onAddHashtag={this._addHashtag}
            onAddSchool={this._addSchool}
          />
          <AddedTags
            addedTags={this.state}
            onDelete={this._deleteTag}
          />
        </ModalComponent.Body>
        <ModalComponent.Actions>
          <footer className="layout layout__grid add_tag_modal__footer">
            <div className="button button-wide button-red action" onClick={this._save}>Save</div>
            <div className="button button-wide action add_tag_modal__cancel_button" onClick={this._handleClose}>Cancel</div>
          </footer>
        </ModalComponent.Actions>
      </ModalComponent>
    );
  }
}
