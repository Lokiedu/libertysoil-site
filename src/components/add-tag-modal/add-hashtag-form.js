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

import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import HashtagSelect from './hashtag-select';
import { Tabs, Tab, TabTitle, TabContent } from '../tabs';
import TagCloud from '../tag-cloud';

export default class AddHashtagForm extends Component {
  static displayName = 'AddHashtagForm';

  static propTypes = {
    onAddHashtag: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.addedHashtags = [];
    this.state = {
      recentHashtags: [],
      selectedHashtags: []
    };
  }

  componentDidMount() {
    if (this.props.addedHashtags) {
      this.addedHashtags = _.clone(this.props.addedHashtags);
    }
    this.getRecentHashtags();
  }

  componentWillReceiveProps(nextProps) {
    if (this.addedHashtags.length > nextProps.addedHashtags.length) {
      let removed = _.difference(this.addedHashtags, nextProps.addedHashtags);

      removed.forEach(tag => {
        const index = _.findIndex(this.state.recentHashtags, t => tag.name === t.name);
        let selectedHashtags = _.clone(this.state.selectedHashtags);
        _.remove(selectedHashtags, i => index === i);
        this.setState({ selectedHashtags: selectedHashtags });
      });
    }
    this.addedHashtags = _.clone(nextProps.addedHashtags);
  }

  async getRecentHashtags() {
    const client = new ApiClient(API_HOST);
    try {
      const hashtags = await client.userRecentHashtags();
      this.setState({ recentHashtags: hashtags });
      return hashtags;
    } catch (e) {
      return e.message;
    }
  }

  _handleEnter = (event) => {
    event.preventDefault();

    let tagName = this._input.value.trim();

    this._addTag({name: tagName});
  };

  _selectHashtag = (tag) => {
    const index = _.findIndex(this.state.recentHashtags, t => t.name === tag.name);
    let selectedHashtags = _.clone(this.state.selectedHashtags);
    selectedHashtags.push(index);
    this.setState({ selectedHashtags: selectedHashtags });

    this._addTag(tag);
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
    let recentHashtags = [];
    if (Array.isArray(this.state.recentHashtags)) {
      recentHashtags = _.clone(this.state.recentHashtags).filter((tag, i) => this.state.selectedHashtags.indexOf(i) === -1);
    }
    const popularHashtags = [];

    return (
      <div className="add_tag_modal add_tag_modal-hashtag">

        <Tabs className="tabs-font_inherit" menuClassName="add_tag_modal__tabs" panelClassName="layout__row add_tag_modal__tab_panel">
          <Tab>
            <TabTitle className="add_tag_modal__tab" classNameActive="add_tag_modal__tab-active">
              Enter manually
            </TabTitle>
            <TabContent>
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
            <TabContent>
              <TagCloud
                hashtags={recentHashtags}
                onClick={this._selectHashtag}
              />
            </TabContent>
          </Tab>
          <Tab>
            <TabTitle className="add_tag_modal__tab" classNameActive="add_tag_modal__tab-active">
              Popular
            </TabTitle>
            <TabContent>
              <TagCloud
                hashtags={popularHashtags}
              />
            </TabContent>
          </Tab>
        </Tabs>
      </div>
    );
  }

}
