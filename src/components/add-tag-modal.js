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
import TabsComponent from '../components/tabs-component';
import TagCloud from '../components/tag-cloud';


export default class AddTagModal extends Component {
  static displayName = 'AddTagModal';

  static propTypes = {
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.string)
  };

  static defaultProps = {
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

    let empty = tagName.length == 0;
    let exists = tags.find(tag => tag == tagName);

    if (empty || exists) {
      return;
    }

    this.refs.input.value = '';

    tags.push(tagName);
    this.setState({tags});
  };

  _renderAddedTags() {
    let tagsToDisplay = this.state.tags.map(tag => ({
      name: tag
    }));

    if (this.state.tags.length > 0) {
      return (
        <div>
          <div className="layout__row">
            Added:
          </div>
          <div className="layout__row">
            <TagCloud
              tags={tagsToDisplay}
            />
          </div>
        </div>
      );
    }
  }

  _save = () => {
    this.props.onSave(this.state.tags);
  };

  render () {
    const {
      onClose
    } = this.props;

    const {
      activeTabIndex
    } = this.state;

    const tabs = [
      {
        title: 'Enter manually',
        id: 'manual'
      }
      //{
      //  title: 'Used recently',
      //  id: 'recently'
      //},
      //{
      //  title: 'Popular',
      //  id: 'popular'
      //}
    ];

    return (
      <ModalComponent
        title="Add hashtags to your post"
        size="normal"
        onHide={onClose}
      >
        <ModalComponent.body>
          <TabsComponent activeIndex={activeTabIndex} tabs={tabs} onSelect={this.selectTab} />
          <div>
            <div className="layout__row tabs_component__content tabs_component__content-highlight tabs_component__content-expanded">
              <div className="layout">
                <div className="layout__grid_item layout__grid_item-wide">
                  <input ref="input" type="text" placeholder="Start typing..." className="input input-block input-transparent input-button_height" />
                </div>
                <div className="layout__grid_item">
                  <span onClick={this._handleAddTag} className="button button-wide button-ligth_blue action">Add</span>
                </div>
              </div>
            </div>
            {this._renderAddedTags()}
          </div>
        </ModalComponent.body>
        <ModalComponent.actions>
          <div className="button button-wide button-red action" onClick={this._save}>Save</div>
        </ModalComponent.actions>
      </ModalComponent>
    );
  }
}
