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

import ModalComponent from '../components/modal-component';
import TagEditor from './add-tag-modal/tag-editor';
import TagIcon from '../components/tag-icon';
import * as TagType from '../utils/tags';
import GeotagSelect from './add-tag-modal/geotag-select';


export default class AddGeotagModal extends Component {
  static displayName = 'AddGeotagModal';

  static propTypes = {
    geotags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })),
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    tags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    visible: PropTypes.bool
  };

  static defaultProps = {
    geotags: [],
    schools: [],
    tags: [],
    visible: false,
    onClose: () => {},
    onSave: () => {}
  };

  state = {
    geotag: {} // Selected geotag
  };

  _handleAddTag = () => {
    let geotags = this._tagEditor.getTags().geotags;
    let geotag = this.state.geotag;

    if (!geotag.id) {
      return;
    }

    if (geotags.find(g => g.id === geotag.id)) {
      return;
    }

    this._input.reset();

    this._tagEditor.addGeotag(geotag);
  };

  _handleSelectTag = (geotag) => {
    this.setState({geotag});
  };

  _save = () => {
    this.props.onSave(_.pick(this.state, 'geotags', 'schools', 'tags'));
  };

  render () {
    let {
      geotags,
      schools,
      tags,
      visible,
      onClose
      } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <ModalComponent
        className="add_tag_modal add_tag_modal-location"
        size="normal"
        onHide={onClose}
      >
        <ModalComponent.Head>
          <ModalComponent.Title>Add geotags to your post</ModalComponent.Title>
          <TagIcon big type={TagType.TAG_LOCATION} />
        </ModalComponent.Head>
        <ModalComponent.Body>
          <div className="add_tag_modal__tabs">
            <div className="add_tag_modal__tab add_tag_modal__tab-active">Enter manually</div>
          </div>

          <div>
            <div className="layout__row add_tag_modal__tab_panel">
              <div className="layout">
                <div className="layout__grid_item layout__grid_item-wide">
                  <form ref="form">
                    <GeotagSelect
                      placeholder="Start typing..."
                      ref={(c) => this._input = c}
                      onSelect={this._handleSelectTag}
                    />
                  </form>
                </div>
                <div className="layout__grid_item">
                  <span
                    className="button button-wide add_tag_modal__add_button action"
                    onClick={this._handleAddTag}
                  >
                    Add
                  </span>
                </div>
              </div>
            </div>
            <TagEditor
              geotags={geotags}
              ref={(c) => this._tagEditor = c}
              schools={schools}
              tags={tags}
            />
          </div>
        </ModalComponent.Body>
        <ModalComponent.Actions>
          <footer className="add_tag_modal__footer">
            <div className="button button-wide button-red action" onClick={this._save}>Save</div>
          </footer>
        </ModalComponent.Actions>
      </ModalComponent>
    );
  }
}
