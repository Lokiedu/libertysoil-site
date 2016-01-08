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
import React from 'react';
import { IndexLink } from 'react-router';

import Header from '../../components/header';
import Footer from '../../components/footer';
import PageContentLink from '../../components/page-content-link';
import SchoolHeader from '../../components/school-header';
import Sidebar from '../../components/sidebar';
import SidebarAlt from '../../components/sidebarAlt';

export default class BaseSchoolPage extends React.Component {
  static displayName = 'BaseSchoolPage'
  render () {
    let {
      current_user,
      page_school,
      is_logged_in,
      followTriggers
    } = this.props;

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user}/>

        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user}/>

            <div className="page__content page__content-fill">
              <SchoolHeader
                school={page_school}
                current_user={current_user}
                followTriggers={followTriggers}
              />

              <div className="page__content page__content-horizontal_space">
                <div className="layout__space-double">
                  <div className="layout__grid tabs">
                    <div className="layout__grid_item">
                      <IndexLink
                        activeClassName="tabs__link-active"
                        className="tabs__link"
                        to={`/s/${page_school.url_name}`}
                      >
                        About
                      </IndexLink>
                    </div>
                    <div className="layout__grid_item">
                      <PageContentLink
                        activeClassName="tabs__link-active"
                        className="tabs__link"
                        to={`/s/${page_school.url_name}/edit`}
                        visible={true}
                      >
                        Edit
                      </PageContentLink>
                    </div>
                  </div>
                </div>
                <div className="layout__row layout__row-double">
                  {this.props.children}
                </div>
              </div>
            </div>
            <SidebarAlt />
          </div>
        </div>

        <Footer/>
      </div>
    );
  }
}
