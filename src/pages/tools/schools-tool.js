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
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Helmet from 'react-helmet';
import { Link } from 'react-router';

import { School } from '../../prop-types/schools';
import { uuid4 } from '../../prop-types/common';
import createSelector from '../../selectors/createSelector';
import { ActionsTrigger } from '../../triggers';
import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import Button from '../../components/button';
import VisibilitySensor from '../../components/visibility-sensor';
import TagIcon from '../../components/tag-icon';
import { TAG_SCHOOL } from '../../consts/tags';


class SchoolsToolPage extends React.Component {
  static displayName = 'SchoolsToolPage';

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    schools: ImmutablePropTypes.mapOf(School, uuid4).isRequired,
    schools_river: ImmutablePropTypes.listOf(uuid4).isRequired,
    ui: ImmutablePropTypes.contains({
      progress: ImmutablePropTypes.contains({
        loadingSchoolsRiver: PropTypes.bool
      }).isRequired
    })
  };

  static async fetchData(params, store, client) {
    const trigger = new ActionsTrigger(client, store.dispatch);
    await trigger.toolsLoadSchoolsRiver({ limit: 10, sort: 'name' });
  }

  state = {
    displayLoadMore: true
  }

  handleLoadSchools = async () => {
    const client = new ApiClient(API_HOST);
    const trigger = new ActionsTrigger(client, this.props.dispatch);
    const result = await trigger.toolsLoadSchoolsRiver({
      limit: 10,
      offset: this.props.schools_river.size,
      order: 'name'
    });

    // Hide 'Load more' button when there are no more schools to show.
    if (Array.isArray(result) && result.length === 0) {
      this.setState({ displayLoadMore: false });
    }
  };

  handleLoadOnSensor = async (isVisible) => {
    if (isVisible && !this.props.ui.getIn(['progress', 'loadingSchoolsRiver'])) {
      this.handleLoadSchools();
    }
  };

  render() {
    const {
      schools,
      schools_river,
      ui
    } = this.props;

    const schoolsToDisplay = schools_river.map(schoolId => schools.get(schoolId));

    return (
      <div>
        <Helmet title="Schools tool on " />
        {schoolsToDisplay.map((school, index) =>
          <div className="tools_page__item" key={index}>
            <TagIcon type={TAG_SCHOOL} />
            <Link className="schools_tool__school_link" to={`/s/${school.get('url_name')}`}>{school.get('name')}</Link>
          </div>
        )}
        <div className="layout layout-align_center layout__space layout__space-double">
          {this.state.displayLoadMore &&
            <VisibilitySensor onChange={this.handleLoadOnSensor}>
              <Button
                title="Load more..."
                waiting={ui.getIn(['progress', 'loadingSchoolsRiver'])}
                onClick={this.handleLoadSchools}
              />
            </VisibilitySensor>
          }
        </div>
      </div>
    );
  }
}

const selector = createSelector(
  state => state.get('ui'),
  state => state.get('schools'),
  state => state.getIn(['tools', 'schools_river']),
  (ui, schools, schools_river) => ({
    ui,
    schools,
    schools_river
  })
);

export default connect(selector)(SchoolsToolPage);
