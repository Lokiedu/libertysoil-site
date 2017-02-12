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
import { Map as ImmutableMap } from 'immutable';

import { Tab, Tabs, TagCloud } from '../../deps';

import GeotagSelect from './select';

const TAB_TITLES = ['Enter manually', 'Used recently', 'Popular'];

export default class AddGeotagForm extends Component {
  static displayName = 'AddGeotagForm';

  static propTypes = {
    addedGeotags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string
    })).isRequired,
    onAddGeotag: PropTypes.func.isRequired,
    triggers: PropTypes.shape({
      checkGeotagExists: PropTypes.func.isRequired
    }),
    userRecentGeotags: PropTypes.arrayOf(PropTypes.shape({
      url_name: PropTypes.string
    })).isRequired
  };

  _selectRecentlyUsedGeotag = (tag) => {
    const index = this.props.userRecentGeotags.findIndex(t => t.get('url_name') === tag.urlId);
    this._addTag(this.props.userRecentGeotags.get(index).toJS());
  };

  submitHandler = async (e) => {
    e.preventDefault();

    const name = this._input.getValue();
    const exists = await this.props.triggers.checkGeotagExists(name);

    if (exists) {
      const model = this._input.getFirstOverlapModel();
      this._addTag(model);
    }
  }

  _addTag = (geotag) => {
    const { addedGeotags } = this.props;

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
    const tabClassName = 'add_tag_modal__tab_panel add_tag_modal__tab_panel-top_colored';

    return (
      <div className="add_tag_modal add_tag_modal-location">
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
              <form onSubmit={this.submitHandler}>
                <div className="layout">
                  <div className="layout__grid_item layout__grid_item-wide">
                    <GeotagSelect
                      placeholder="Start typing..."
                      ref={(c) => this._input = c}
                      onSelect={this._addTag}
                    />
                  </div>
                  <div className="layout__grid_item">
                    <input className="button button-wide add_tag_modal__add_button action" type="submit" value="Add" />
                  </div>
                </div>
              </form>
            </Tab.Content>

            <Tab.Content className={tabClassName} index={1}>
              Used recently:
              <TagCloud
                action="add"
                className="add_tag_modal__tags-panel"
                tags={ImmutableMap({ geotags: this.props.userRecentGeotags })}
                onClick={this._selectRecentlyUsedGeotag}
              />
            </Tab.Content>

            <Tab.Content className={tabClassName} index={2}>
              Popular:
              <TagCloud
                action="add"
                className="add_tag_modal__tags-panel"
                tags={ImmutableMap({ geotags: popularGeotags })}
              />
            </Tab.Content>

          </div>
        </Tabs>
      </div>
    );
  }
}
