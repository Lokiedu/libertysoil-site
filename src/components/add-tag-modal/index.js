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
import i from 'immutable';

import {
  ArrayOfGeotagsPropType, ArrayOfHashtagsPropType, ArrayOfSchoolsPropType, ArrayOfLightSchoolsPropType,
  TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL, IMPLEMENTED_TAGS,
  ModalComponent, TagCloud
} from './deps';

import ModalSwitcher from './switcher';
import AddTagForm from './form';

function AddedTags({ addedTags, onDelete }) {
  if (!addedTags.geotags.size &&
      !addedTags.schools.size &&
      !addedTags.hashtags.size) {
    return null;
  }

  return (
    <div className="layout__row">
      <div className="layout__row">
        Added:
      </div>
      <div className="layout__row add_tag_modal__added_tags">
        <TagCloud
          action="delete"
          tags={i.fromJS(addedTags)}
          onClick={onDelete}
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
    addedGeotags: ArrayOfGeotagsPropType,
    addedHashtags: ArrayOfHashtagsPropType,
    addedSchools: PropTypes.oneOfType([ArrayOfSchoolsPropType, ArrayOfLightSchoolsPropType]),
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    onTypeChange: PropTypes.func,
    triggers: PropTypes.shape({
      checkSchoolExists: PropTypes.func.isRequired,
      checkGeotagExists: PropTypes.func.isRequired
    }),
    type: PropTypes.oneOf(IMPLEMENTED_TAGS),
    userRecentTags: PropTypes.shape({
      geotags: ArrayOfGeotagsPropType.isRequired,
      hashtags: ArrayOfHashtagsPropType.isRequired,
      schools: ArrayOfSchoolsPropType.isRequired
    }).isRequired
  };

  static defaultProps = {
    addedGeotags: i.List(),
    addedSchools: i.List(),
    addedHashtags: i.List(),
    onClose: () => {},
    onSave: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      geotags: this.props.addedGeotags,
      schools: this.props.addedSchools,
      hashtags: this.props.addedHashtags
    };
  }

  reset = () => {
    this.setState({
      geotags: this.props.addedGeotags,
      schools: this.props.addedSchools,
      hashtags: this.props.addedHashtags
    });
  };

  _save = () => {
    this.props.onSave(this.state);
  };

  _addGeotag = (geotag) => {
    this.setState({
      geotags: this.state.geotags.push(i.fromJS(geotag))
    });
  };

  _addSchool = (school) => {
    this.setState({
      schools: this.state.schools.push(i.fromJS(school))
    });
  };

  _addHashtag = (hashtag) => {
    this.setState({
      hashtags: this.state.hashtags.push(i.fromJS(hashtag))
    });
  };

  _deleteTag = (displayTag) => {
    switch (displayTag.type) {
      case TAG_LOCATION: {
        this.setState({
          geotags: this.state.geotags.filter(geotag => geotag.get('url_name') !== displayTag.urlId)
        });

        break;
      }
      case TAG_SCHOOL: {
        this.setState({
          schools: this.state.schools.filter(school => school.get('url_name') !== displayTag.urlId)
        });

        break;
      }
      case TAG_HASHTAG: {
        this.setState({
          hashtags: this.state.hashtags.filter(hashtag => hashtag.get('name') !== displayTag.urlId)
        });

        break;
      }
    }
  };

  _handleClose = (event) => {
    this.reset();
    this.props.onClose(event);
  };

  render() {
    const {
      type,
      onTypeChange,
      userRecentTags
    } = this.props;

    if (!type) {
      return null;
    }

    // Use only recent tags that haven't been added to the form.
    const recentGeotags = userRecentTags.get('geotags').filter(lhs =>
      !this.state.geotags.find(rhs => lhs.get('name') === rhs.get('name'))
    );
    const recentHashtags = userRecentTags.get('hashtags').filter(lhs =>
      !this.state.hashtags.find(rhs => lhs.get('name') === rhs.get('name'))
    );
    const recentSchools = userRecentTags.get('schools').filter(lhs =>
      !this.state.schools.find(rhs => lhs.get('name') === rhs.get('name'))
    );
    const userRecentTagsDiff = { geotags: recentGeotags, hashtags: recentHashtags, schools: recentSchools };


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
            triggers={this.props.triggers}
            type={type}
            userRecentTags={userRecentTagsDiff}
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
