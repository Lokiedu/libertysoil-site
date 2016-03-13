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
import GeotagSelect from './geotag-select';
import { preventDefault } from '../../utils/preventDefault';
import { Tabs, Tab, TabTitle, TabContent } from '../tabs';
import TagCloud from '../tag-cloud';


export default class AddGeotagForm extends Component {
  static displayName = 'AddGeotagForm';

  static propTypes = {
    addedGeotags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string
    })).isRequired,
    onAddGeotag: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.addedGeotags = [];
    this.state = {
      recentGeotags: [],
      selectedGeotags: []
    };
  }

  componentDidMount() {
    if (this.props.addedGeotags) {
      this.addedGeotags = _.clone(this.props.addedGeotags);
    }
    this.getRecentGeotags();
  }

  componentWillReceiveProps(nextProps) {
    if (this.addedGeotags.length > nextProps.addedGeotags.length) {
      let removed = _.difference(this.addedGeotags, nextProps.addedGeotags);

      removed.forEach(tag => {
        const index = _.findIndex(this.state.recentGeotags, t => t.url_name === tag.urlId);
        let selectedGeotags = _.clone(this.state.selectedGeotags);
        _.remove(selectedGeotags, i => index === i);
        this.setState({ selectedGeotags: selectedGeotags });
      });
    }
    this.addedGeotags = _.clone(nextProps.addedGeotags);
  }

  async getRecentGeotags() {
    const client = new ApiClient(API_HOST);
    try {
      const geotags = await client.userRecentGeotags();
      this.setState({ recentGeotags: geotags });
      return geotags;
    } catch (e) {
      return e.message;
    }
  }

  _selectGeotag = (tag) => {
    const index = _.findIndex(this.state.recentGeotags, t => t.url_name === tag.urlId);
    let selectedGeotags = _.clone(this.state.selectedGeotags);
    selectedGeotags.push(index);
    this.setState({ selectedGeotags: selectedGeotags });

    this._addTag(tag);
  };

  _addTag = (geotag) => {
    let { addedGeotags } = this.props;

    if (!geotag.urlId && !geotag.url_name) {
      return;
    }

    if (addedGeotags.find(g => g.urlId === (geotag.urlId || geotag.url_name))) {
      return;
    }

    this._input.reset();

    this.props.onAddGeotag(geotag);
  };

  render() {
    let recentGeotags = [];
    if (Array.isArray(this.state.recentGeotags)) {
      recentGeotags = _.clone(this.state.recentGeotags).filter((tag, i) => this.state.selectedGeotags.indexOf(i) === -1);
    }
    const popularGeotags = [];

    return (
      <div className="add_tag_modal add_tag_modal-location">

        <Tabs className="tabs-font_inherit" menuClassName="add_tag_modal__tabs" panelClassName="layout__row add_tag_modal__tab_panel">
          <Tab>
            <TabTitle className="add_tag_modal__tab" classNameActive="add_tag_modal__tab-active">
              Enter manually
            </TabTitle>
            <TabContent>
              <div className="layout">
                <div className="layout__grid_item layout__grid_item-wide">
                  <form ref="form" onSubmit={preventDefault}>
                    <GeotagSelect
                      placeholder="Start typing..."
                      ref={(c) => this._input = c}
                      onSelect={this._addTag}
                    />
                  </form>
                </div>
                <div className="layout__grid_item">
                  <span className="button button-wide add_tag_modal__add_button action">
                    Add
                  </span>
                </div>
              </div>
            </TabContent>
          </Tab>
          <Tab>
            <TabTitle className="add_tag_modal__tab" classNameActive="add_tag_modal__tab-active">
              Used recently
            </TabTitle>
            <TabContent>
              <TagCloud
                geotags={recentGeotags}
                onClick={this._selectGeotag}
              />
            </TabContent>
          </Tab>
          <Tab>
            <TabTitle className="add_tag_modal__tab" classNameActive="add_tag_modal__tab-active">
              Popular
            </TabTitle>
            <TabContent>
              <TagCloud
                geotags={popularGeotags}
              />
            </TabContent>
          </Tab>
        </Tabs>
      </div>
    );
  }

}
