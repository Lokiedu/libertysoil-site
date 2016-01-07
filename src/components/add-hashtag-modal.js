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

import ModalComponent from '../components/modal-component';
import TagCloud from '../components/tag-cloud';
import TagIcon from '../components/tag-icon';
import * as TagType from '../utils/tags';


export default class AddHashtagModal extends Component {
  static displayName = 'AddTagModal';

  static propTypes = {
    locations: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    schools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    tags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })),
    onClose: PropTypes.func,
    onSave: PropTypes.func
  };

  static defaultProps = {
    locations: [],
    schools: [],
    tags: [],
    onClose: () => {},
    onSave: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      activeTabIndex: 0,
      tags: props.tags
    };
  }

  selectTab = (index) => {
    this.setState({ activeTabIndex: index });
  };

  _handleAddTag = () => {
    let tags = this.state.tags;
    let tagName = this.refs.input.value.trim();

    if (tagName.length == 0) {
      return;
    }

    if (tags.find(tag => tag.name === tagName)) {
      return;
    }

    this.refs.input.value = '';

    tags.push({name: tagName});
    this.setState({tags});
  };

  _save = () => {
    this.props.onSave({tags: this.state.tags});
  };

  render () {
    let {
      locations,
      schools,
      tags,
      onClose
    } = this.props;

    let shouldRenderAddedTags = schools.length > 0 || locations.length > 0 || tags.length > 0;

    return (
      <ModalComponent
        className="add_tag_modal add_tag_modal-hashtag"
        size="normal"
        onHide={onClose}
      >
        <ModalComponent.Head>
          <ModalComponent.Title>Add hashtags to your post</ModalComponent.Title>
          <TagIcon big type={TagType.TAG_HASHTAG} />
        </ModalComponent.Head>
        <ModalComponent.Body>
          <div className="add_tag_modal__tabs">
            <div className="add_tag_modal__tab add_tag_modal__tab-active">Enter manually</div>
          </div>

          <div>
            <div className="layout__row add_tag_modal__tab_panel">
              <div className="layout">
                <div className="layout__grid_item layout__grid_item-wide">
                  <input ref="input" type="text" placeholder="Start typing..." className="input input-block input-transparent input-button_height" />
                </div>
                <div className="layout__grid_item">
                  <span onClick={this._handleAddTag} className="button button-wide add_tag_modal__add_button action">Add</span>
                </div>
              </div>
            </div>
            {shouldRenderAddedTags &&
              <div className="layout__row">
                <div className="layout__row">
                  Added:
                </div>
                <div className="layout__row add_tag_modal__added_tags">
                  <TagCloud
                    tags={this.state.tags}
                  />
                </div>
              </div>
            }
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
