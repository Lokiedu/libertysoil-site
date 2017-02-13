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
import Helmet from 'react-helmet';
import { replace } from 'react-router-redux';

import { uuid4, Immutable as ImmutablePropType } from '../../prop-types/common';
import { MapOfSchools } from '../../prop-types/schools';
import { CurrentUser } from '../../prop-types/users';
import createSelector from '../../selectors/createSelector';
import currentUserSelector from '../../selectors/currentUser';
import { setSchoolsAlphabet } from '../../actions/tools';
import { ActionsTrigger } from '../../triggers';
import ApiClient from '../../api/client';
import { API_HOST } from '../../config';
import Button from '../../components/button';
import VisibilitySensor from '../../components/visibility-sensor';
import AlphabetFilter from '../../components/tools/alphabet-filter';
import SchoolList from '../../components/tools/school-list';
import SchoolDetails from '../../components/tools/school-details';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../../components/page';
import SidebarAlt from '../../components/sidebarAlt';
import Header from '../../components/header';
import HeaderLogo from '../../components/header-logo';
import Footer from '../../components/footer';
import Sidebar from '../../components/sidebar';


const LIMIT = 25;

class SchoolsToolPage extends React.Component {
  static displayName = 'SchoolsToolPage';

  static propTypes = {
    all_schools_loaded: PropTypes.bool,
    current_user: ImmutablePropType(CurrentUser).isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
      query: PropTypes.shape({
        sort: PropTypes.string,
        startWith: PropTypes.string
      })
    }),
    schools: ImmutablePropType(MapOfSchools).isRequired,
    schools_alphabet: ImmutablePropType(PropTypes.arrayOf(PropTypes.string)),
    schools_river: ImmutablePropType(PropTypes.arrayOf(uuid4)).isRequired,
    ui: ImmutablePropType(
      PropTypes.shape({
        progress: ImmutablePropType(
          PropTypes.shape({
            loadingSchoolsRiver: PropTypes.bool.isRequired
          })
        ).isRequired
      })
    )
  };

  static async fetchData(router, store, client) {
    const trigger = new ActionsTrigger(client, store.dispatch);
    await trigger.toolsLoadSchoolsRiver({
      limit: LIMIT,
      ...router.location.query
    }, false);

    const alphabet = await client.schoolsAlphabet();
    store.dispatch(setSchoolsAlphabet(alphabet));
  }

  state = {
    // I've tried implementing this as a url param. It's not worth it.
    selectedSchoolId: null
  };

  async loadSchools(query = {}) {
    const client = new ApiClient(API_HOST);
    const trigger = new ActionsTrigger(client, this.props.dispatch);
    return await trigger.toolsLoadSchoolsRiver({
      limit: LIMIT,
      ...this.props.location.query,
      ...query
    });
  }

  handleLoadSchools = async () => {
    await this.loadSchools({
      offset: this.props.schools_river.size
    });
  };

  handleLoadOnSensor = async (isVisible) => {
    if (isVisible && !this.props.ui.getIn(['progress', 'loadingSchoolsRiver'])) {
      this.handleLoadSchools();
    }
  };

  handleSelectSchool = (selectedSchoolId) => {
    this.setState({ selectedSchoolId });
  };

  handleChangeSorting = async (e) => {
    const sort = e.target.value;

    this.props.dispatch(replace({
      pathname: this.props.location.pathname,
      query: Object.assign(this.props.location.query, {
        sort
      })
    }));

    await this.loadSchools({ offset: 0, sort });
    this.setState({ selectedSchoolId: null });
  };

  handleSelectLetter = async (letter) => {
    const query = this.props.location.query;

    if (letter === this.props.location.query.startWith) {
      delete query.startWith;
    } else {
      query.startWith = letter;
    }

    this.props.dispatch(replace({
      pathname: this.props.location.pathname,
      query
    }));

    await this.loadSchools(Object.assign(query, { offset: 0 }));
    this.setState({ selectedSchoolId: null });
  }

  render() {
    const {
      current_user,
      schools,
      schools_river,
      schools_alphabet,
      ui
    } = this.props;

    const client = new ApiClient(API_HOST);
    const triggers = new ActionsTrigger(client, this.props.dispatch);
    const followSchoolTriggers = { followTag: triggers.followSchool, unfollowTag: triggers.unfollowSchool };
    const schoolsToDisplay = schools_river.map(schoolId => schools.get(schoolId));
    const sortQuery = this.props.location.query.sort || 'name';

    const selectedSchoolId = this.state.selectedSchoolId || schools_river.get(0);
    const selectedSchool = schools.get(selectedSchoolId);

    return (
      <div>
        <Helmet title="Schools tool on " />
        <Header current_user={current_user} is_logged_in={!!current_user.get('id')}>
          <HeaderLogo small />
        </Header>

        <Page>
          <PageMain>
            <PageBody>
              <Sidebar />
              <PageContent>
                <SchoolDetails
                  current_user={current_user}
                  school={selectedSchool}
                  triggers={followSchoolTriggers}
                />
              </PageContent>
              <SidebarAlt>
                <div className="tools_page__filter">
                  <div className="schools_tool__sort">
                    <span className="micon">sort</span>
                    <select value={sortQuery} onChange={this.handleChangeSorting}>
                      <option value="name">Alphabetically</option>
                      <option value="-updated_at">Last modified</option>
                    </select>
                  </div>
                  <AlphabetFilter
                    alphabet={schools_alphabet}
                    selectedLetter={this.props.location.query.startWith}
                    onSelect={this.handleSelectLetter}
                  />
                </div>
                <SchoolList
                  schools={schoolsToDisplay}
                  selectedSchoolId={selectedSchoolId}
                  onClick={this.handleSelectSchool}
                />
                <div className="layout layout-align_center layout__space layout__space-double">
                  {!this.props.all_schools_loaded &&
                    <VisibilitySensor onChange={this.handleLoadOnSensor}>
                      <Button
                        title="Load more..."
                        waiting={ui.getIn(['progress', 'loadingSchoolsRiver'])}
                        onClick={this.handleLoadSchools}
                      />
                    </VisibilitySensor>
                  }
                </div>
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>
        <Footer />
      </div>
    );
  }
}

const selector = createSelector(
  state => state.get('ui'),
  state => state.get('schools'),
  currentUserSelector,
  state => state.getIn(['tools', 'schools_river']),
  state => state.getIn(['tools', 'all_schools_loaded']),
  state => state.getIn(['tools', 'schools_alphabet']),
  (ui, schools, current_user, schools_river, all_schools_loaded, schools_alphabet) => ({
    ui,
    schools,
    schools_river,
    all_schools_loaded,
    schools_alphabet,
    ...current_user
  })
);

export default connect(selector)(SchoolsToolPage);
