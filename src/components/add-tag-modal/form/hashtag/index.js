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
import { findIndex } from 'lodash';

import { Tab, Tabs } from '../../deps';
import { TagCloud } from '../../deps';

import HashtagSelect from './select';

const TAB_TITLES = ['Enter manually', 'Used recently', 'Popular'];

export default class AddHashtagForm extends Component {
  static displayName = 'AddHashtagForm';

  static propTypes = {
    addedHashtags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })).isRequired,
    onAddHashtag: PropTypes.func.isRequired,
    userRecentHashtags: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })).isRequired
  };

  _handleEnter = (event) => {
    event.preventDefault();

    const tagName = this._input.value.trim();

    this._addTag({ name: tagName });
  };

  _selectRecentlyUsedHashtag = (tag) => {
    const index = findIndex(this.props.userRecentHashtags, t => t.name === tag.name);
    this._addTag(this.props.userRecentHashtags[index]);
  };

  _addTag = (tag) => {
    const { addedHashtags } = this.props;

    if (tag.name.length < 3) {
      return;
    }

    if (addedHashtags.find(addedTag => addedTag.name === tag.name)) {
      return;
    }

    this._input.reset();

    this.props.onAddHashtag(tag);
  };

  render() {
    const popularHashtags = [];
    const tabClassName = 'add_tag_modal__tab_panel add_tag_modal__tab_panel-top_colored';

    return (
      <div className="add_tag_modal add_tag_modal-hashtag">
        <Tabs>
          <div className="tabs-font_inherit">
            <div className="add_tag_modal__tabs">
              {TAB_TITLES.map((title, i) => (
                <Tab.Title activeClassName="add_tag_modal__tab-active" className="add_tag_modal__tab" index={i} key={i}>
                  {title}
                </Tab.Title>
              ))}
            </div>

            <Tab.Content className={`${tabClassName} add_tag_modal__tab_panel-colored`} index={0}>
              <form onSubmit={this._handleEnter}>
                <div className="layout">
                  <div className="layout__grid_item layout__grid_item-wide">
                    <HashtagSelect
                      placeholder="Start typing..."
                      ref={(c) => this._input = c}
                      onSelect={this._addTag}
                    />
                  </div>
                  <div className="layout__grid_item">
                    <button className="button button-wide add_tag_modal__add_button action">
                      Add
                    </button>
                  </div>
                </div>
              </form>
            </Tab.Content>

            <Tab.Content className={tabClassName} index={1}>
              <div className="layout__row">
                Used recently:
              </div>
              <div className="layout__row">
                <TagCloud
                  action="add"
                  tags={{ hashtags: this.props.userRecentHashtags }}
                  onClick={this._selectRecentlyUsedHashtag}
                />
              </div>
            </Tab.Content>

            <Tab.Content className={tabClassName} index={2}>
              <div className="layout__row">
                Popular:
              </div>
              <div className="layout__row">
                <TagCloud
                  action="add"
                  tags={{ hashtags: popularHashtags }}
                />
              </div>
            </Tab.Content>
          </div>
        </Tabs>
      </div>
    );
  }
}
