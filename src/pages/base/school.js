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
import { Link, IndexLink } from 'react-router';

import {
  Page,
  PageMain,
  PageCaption,
  PageHero,
  PageBody,
  PageContent
}                       from '../../components/page';
import Header           from '../../components/header';
import HeaderLogo       from '../../components/header-logo';
import Breadcrumbs      from '../../components/breadcrumbs';
import Tag              from '../../components/tag';
import TagIcon          from '../../components/tag-icon';
import Footer           from '../../components/footer';
import SchoolHeader     from '../../components/school-header';
import Sidebar          from '../../components/sidebar';
import SidebarAlt       from '../../components/sidebarAlt';
import { TAG_SCHOOL }   from '../../consts/tags';


export default class BaseSchoolPage extends React.Component {
  static displayName = 'BaseSchoolPage';
  render () {
    let {
      current_user,
      page_school,
      is_logged_in,
      triggers
    } = this.props;

    return (
      <div>
        <Header is_logged_in={is_logged_in} current_user={current_user}>
          <HeaderLogo small />
          <Breadcrumbs>
            <Link to="/s" title="All Schools">
              <TagIcon inactive type={TAG_SCHOOL} />
            </Link>
            <Tag name={page_school.name} type={TAG_SCHOOL} urlId={page_school.url_name} />
          </Breadcrumbs>
        </Header>

        <Page>
          <Sidebar current_user={current_user} />
          <PageMain className="page__main-no_space">
            <PageCaption>
              {page_school.name}
            </PageCaption>
            <PageHero src="/images/hero/welcome.jpg" />
            <PageBody className="page__body-up">
              <SchoolHeader
                is_logged_in={is_logged_in}
                school={page_school}
                current_user={current_user}
                triggers={triggers}
              />
            </PageBody>
            <PageBody className="page__body-up">
              <PageContent>
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
                      <Link
                        activeClassName="tabs__link-active"
                        className="tabs__link"
                        to={`/s/${page_school.url_name}/edit`}
                        visible={true}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="layout__row">
                  {this.props.children}
                </div>
              </PageContent>
              <SidebarAlt />
            </PageBody>
          </PageMain>
        </Page>

        <Footer/>
      </div>
    );
  }
}
