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

import SchoolSelect from './school-select';
import { preventDefault } from '../../utils/preventDefault';
import { Tabs, Tab, TabTitle, TabContent } from '../tabs';
import TagCloud from '../tag-cloud';


export default class AddSchoolForm extends Component {
  static displayName = 'AddSchoolForm';

  static propTypes = {
    addedSchools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })).isRequired,
    allSchools: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    })).isRequired,
    onAddSchool: PropTypes.func.isRequired,
    userRecentSchools: PropTypes.array.isRequired
  };

  _selectRecentlyUsedSchool = (tag) => {
    const index = _.findIndex(this.props.userRecentSchools, t => t.url_name === tag.urlId);
    this._addTag(this.props.userRecentSchools[index]);
  };

  _addTag = (school) => {
    let { addedSchools } = this.props;

    if (addedSchools.find(s => s.name === school.name)) {
      return;
    }

    if (!this.props.allSchools.find(s => s.name === school.name)) {
      return;
    }

    this._input.reset();

    this.props.onAddSchool(school);
  };

  render() {
    const popularSchools = [];

    return (
      <div className="add_tag_modal add_tag_modal-school">

        <Tabs className="tabs-font_inherit" menuClassName="add_tag_modal__tabs" panelClassName="layout__row add_tag_modal__tab_panel">
          <Tab>
            <TabTitle className="add_tag_modal__tab" classNameActive="add_tag_modal__tab-active">
              Enter manually
            </TabTitle>
            <TabContent>
              <form onSubmit={preventDefault}>
                <div className="layout">
                  <div className="layout__grid_item layout__grid_item-wide">
                    <SchoolSelect
                      placeholder="Start typing..."
                      ref={(c) => this._input = c}
                      schools={this.props.allSchools}
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
                schools={this.props.userRecentSchools}
                onClick={this._selectRecentlyUsedSchool}
              />
            </TabContent>
          </Tab>
          <Tab>
            <TabTitle className="add_tag_modal__tab" classNameActive="add_tag_modal__tab-active">
              Popular
            </TabTitle>
            <TabContent>
              <TagCloud
                schools={popularSchools}
              />
            </TabContent>
          </Tab>
        </Tabs>
      </div>
    );
  }

}
