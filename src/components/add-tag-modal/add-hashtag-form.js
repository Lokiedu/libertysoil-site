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

import HashtagSelect from './hashtag-select';
import { Tabs, Tab, TabTitle, TabContent } from '../tabs';
import TagCloud from '../tag-cloud';

export default class AddHashtagForm extends Component {
  static displayName = 'AddHashtagForm';

  static propTypes = {
    onAddHashtag: PropTypes.func.isRequired,
    userRecentHashtags: PropTypes.array.isRequired
  };

  _handleEnter = (event) => {
    event.preventDefault();

    let tagName = this._input.value.trim();

    this._addTag({ name: tagName });
  };

  _selectRecentlyUsedHashtag = (tag) => {
    const index = _.findIndex(this.props.userRecentHashtags, t => t.name === tag.name);
    this._addTag(this.props.userRecentHashtags[index]);
  };

  _addTag = (tag) => {
    let { addedHashtags } = this.props;

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

    return (
      <div className="add_tag_modal add_tag_modal-hashtag">

        <Tabs className="tabs-font_inherit" menuClassName="add_tag_modal__tabs">
          <Tab>
            <TabTitle className="add_tag_modal__tab" classNameActive="add_tag_modal__tab-active">
              Enter manually
            </TabTitle>
            <TabContent className="add_tag_modal__tab_panel add_tag_modal__tab_panel-colored">
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
            </TabContent>
          </Tab>
          <Tab>
            <TabTitle className="add_tag_modal__tab" classNameActive="add_tag_modal__tab-active">
              Used recently
            </TabTitle>
            <TabContent className="add_tag_modal__tab_panel add_tag_modal__tab_panel-top_colored">
              Used recently:
              <div className="layout__row">
                <TagCloud
                  hashtags={this.props.userRecentHashtags}
                  onClick={this._selectRecentlyUsedHashtag}
                />
              </div>
            </TabContent>
          </Tab>
          <Tab>
            <TabTitle className="add_tag_modal__tab" classNameActive="add_tag_modal__tab-active">
              Popular
            </TabTitle>
            <TabContent className="add_tag_modal__tab_panel add_tag_modal__tab_panel-top_colored">
              Popular:
              <div className="layout__row">
                <TagCloud
                  hashtags={popularHashtags}
                />
              </div>
            </TabContent>
          </Tab>
        </Tabs>
      </div>
    );
  }

}
