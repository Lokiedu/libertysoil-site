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


export default class AddHashtagModal extends Component {
  static displayName = 'AddHashtagModal';

  static propTypes = {
    geotags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })),
    switcher: PropTypes.element,
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

  _handleAddTag = (event) => {
    event.preventDefault();

    let tags = this._tagEditor.getTags().tags;
    let tagName = this.refs.input.value.trim();

    if (tagName.length < 3) {
      return;
    }

    if (tags.find(tag => tag.name === tagName)) {
      return;
    }

    this.refs.input.value = '';

    this._tagEditor.addTag({name: tagName});
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
      onClose,
      switcher
    } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <ModalComponent
        className="add_tag_modal add_tag_modal-hashtag"
        size="normal"
        onHide={onClose}
      >
        <ModalComponent.Head>
          <ModalComponent.Title>Add hashtags to your post</ModalComponent.Title>
          {switcher}
        </ModalComponent.Head>
        <ModalComponent.Body>
          <div className="add_tag_modal__tabs">
            <div className="add_tag_modal__tab add_tag_modal__tab-active">Enter manually</div>
          </div>

          <div>
            <div className="layout__row add_tag_modal__tab_panel">
              <div className="layout">
                <div className="layout__grid_item layout__grid_item-wide">
                  <form onSubmit={this._handleAddTag}>
                    <input
                      className="input input-block input-transparent input-button_height"
                      placeholder="Start typing..."
                      ref="input"
                      type="text"
                      maxLength="72"
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
