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
import React, { PropTypes, Component } from 'react';
import _ from 'lodash';

import ModalComponent from './modal-component';
import ModalSwitcher from './add-tag-modal/modal-switcher';
import TagCloud from './tag-cloud';
import AddTagForm from './add-tag-modal/add-tag-form';
import { TAG_HASHTAG, TAG_LOCATION, TAG_SCHOOL, IMPLEMENTED_TAGS } from '../consts/tags';


function AddedTags({ addedTags, onDelete }) {
  if (!addedTags.geotags.length &&
      !addedTags.schools.length &&
      !addedTags.hashtags.length) {
    return <noscript />;
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
    geotags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })),
    userRecentTags: PropTypes.shape({
      geotags: PropTypes.array.isRequired,
      schools: PropTypes.array.isRequired,
      hashtags: PropTypes.array.isRequired
    }).isRequired,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    onTypeChange: PropTypes.func,
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    hashtags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    type: PropTypes.oneOf(IMPLEMENTED_TAGS),
    triggers: PropTypes.shape({
      checkSchoolExists: PropTypes.func.isRequired,
      checkGeotagExists: PropTypes.func.isRequired
    })
  };

  static defaultProps = {
    geotags: [],
    schools: [],
    hashtags: [],
    onClose: () => {},
    onSave: () => {}
  };

  state = {
    geotags: _.clone(this.props.geotags),
    schools: _.clone(this.props.schools),
    hashtags: _.clone(this.props.hashtags)
  };

  reset = () => {
    this.setState({
      geotags: _.clone(this.props.geotags),
      schools: _.clone(this.props.schools),
      hashtags: _.clone(this.props.hashtags)
    });
  };

  _save = () => {
    this.props.onSave(_.pick(this.state, 'geotags', 'schools', 'hashtags'));
  };

  _addGeotag = (geotag) => {
    let state = _.pick(this.state, 'geotags');

    state.geotags.push(geotag);

    this.setState(state);
  };

  _addSchool = (school) => {
    let state = _.pick(this.state, 'schools');

    state.schools.push(school);

    this.setState(state);
  };

  _addHashtag = (tag) => {
    let state = _.pick(this.state, 'hashtags');

    state.hashtags.push(tag);

    this.setState(state);
  };

  _deleteTag = (displayTag) => {
    let state = _.clone(this.state);

    switch (displayTag.type) {
      case TAG_LOCATION: {
        _.remove(state.geotags, geotag => geotag.url_name === displayTag.urlId);

        break;
      }
      case TAG_SCHOOL: {
        _.remove(state.schools, school => school.url_name === displayTag.urlId);

        break;
      }
      case TAG_HASHTAG: {
        _.remove(state.hashtags, hashtag => hashtag.name === displayTag.urlId);

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
    let {
      allSchools,
      type,
      onTypeChange
    } = this.props;

    if (!type) {
      return null;
    }

    const recentGeotags = _.differenceWith(
      this.props.userRecentTags.geotags, this.state.geotags, (a, b) => a.name === b.name);
    const recentSchools = _.differenceWith(
      this.props.userRecentTags.schools, this.state.schools, (a, b) => a.name === b.name);
    const recentHashtags = _.differenceWith(
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
            userRecentTags={userRecentTags}
            type={type}
            onAddGeotag={this._addGeotag}
            onAddHashtag={this._addHashtag}
            onAddSchool={this._addSchool}
            triggers={this.props.triggers}
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
