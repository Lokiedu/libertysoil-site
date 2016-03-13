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
    onAddSchool: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.addedSchools = [];
    this.state = {
      recentSchools: [],
      selectedSchools: []
    };
  }

  componentDidMount() {
    if (this.props.addedSchools) {
      this.addedSchools = _.clone(this.props.addedSchools);
    }
    this.getRecentSchools();
  }

  componentWillReceiveProps(nextProps) {
    if (this.addedSchools.length > nextProps.addedSchools.length) {
      let removed = _.difference(this.addedSchools, nextProps.addedSchools);

      removed.forEach(tag => {
        const index = _.findIndex(this.state.recentSchools, t => tag.name === t.name);
        let selectedSchools = _.clone(this.state.selectedSchools);
        _.remove(selectedSchools, i => index === i);
        this.setState({ selectedSchools: selectedSchools });
      });
    }
    this.addedSchools = _.clone(nextProps.addedSchools);
  }

  async getRecentSchools() {
    const client = new ApiClient(API_HOST);
    try {
      const schools = await client.userRecentSchools();
      this.setState({ recentSchools: schools });

      this.removeSelected();
      return schools;
    } catch (e) {
      return e.message;
    }
  }

  removeSelected() {
    const selectedSchools = this.state.recentSchools.map((school, index) => {
      if (_.findIndex(this.addedSchools, s => s.name === school.name) != -1) {
        return index;
      }
      return undefined;
    }).filter(v => v !== undefined);
    this.setState({ selectedSchools: selectedSchools });
  }

  _selectSchool = (tag) => {
    const index = _.findIndex(this.state.recentSchools, t => t.url_name === tag.urlId);
    let selectedSchools = _.clone(this.state.selectedSchools);
    selectedSchools.push(index);
    this.setState({ selectedSchools: selectedSchools });

    this._addTag(tag);
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
    let recentSchools = [];
    if (Array.isArray(this.state.recentSchools)) {
      recentSchools = _.clone(this.state.recentSchools).filter((tag, i) => this.state.selectedSchools.indexOf(i) === -1);
    }
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
                schools={recentSchools}
                onClick={this._selectSchool}
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
