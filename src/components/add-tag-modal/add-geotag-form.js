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
    onAddGeotag: PropTypes.func.isRequired,
    userRecentGeotags: PropTypes.array.isRequired
  };

  _selectRecentlyUsedGeotag = (tag) => {
    const index = _.findIndex(this.props.userRecentGeotags, t => t.url_name === tag.urlId);
    this._addTag(this.props.userRecentGeotags[index]);
  };

  _addTag = (geotag) => {
    let { addedGeotags } = this.props;

    if (!geotag.id) {
      return;
    }

    if (addedGeotags.find(g => g.id === geotag.id)) {
      return;
    }

    this._input.reset();

    this.props.onAddGeotag(geotag);
  };

  render() {
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
                geotags={this.props.userRecentGeotags}
                onClick={this._selectRecentlyUsedGeotag}
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
