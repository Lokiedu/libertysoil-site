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
import React, { PropTypes } from 'react';
import { Link, IndexLink } from 'react-router';
import { find } from 'lodash';

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
import CreatePost       from '../../components/create-post';
import Breadcrumbs      from '../../components/breadcrumbs/breadcrumbs';
import Tag              from '../../components/tag';
import TagIcon          from '../../components/tag-icon';
import Footer           from '../../components/footer';
import SchoolHeader     from '../../components/school-header';
import Sidebar          from '../../components/sidebar';
import SidebarAlt       from '../../components/sidebarAlt';
import AddedTags        from '../../components/post/added-tags';
import { TAG_SCHOOL }   from '../../consts/tags';


export default class BaseSchoolPage extends React.Component {
  static displayName = 'BaseSchoolPage';

  static propTypes = {
    actions: PropTypes.shape({
      resetCreatePostForm: PropTypes.func.isRequired,
      updateCreatePostForm: PropTypes.func.isRequired
    }).isRequired,
    schools: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    page_school: PropTypes.shape({
      url_name: PropTypes.string.isRequired
    }).isRequired
  };

  state = {
    form: false
  };

  componentWillReceiveProps(nextProps) {
    if (this.state.form) {
      const postSchools = this.props.create_post_form.schools;

      if (!find(postSchools, tag => tag.url_name === nextProps.page_school.url_name)) {
        this.setState({ form: false });
      }
    }
  }

  componentWillUnmount() {
    this.props.actions.resetCreatePostForm();
  }

  toggleForm = () => {
    if (!this.state.form) {
      const school = this.props.page_school;
      this.props.actions.resetCreatePostForm();
      this.props.actions.updateCreatePostForm({ schools: [school] });
    }

    this.setState({ form: !this.state.form });
  };

  render() {
    let {
      current_user,
      page_school,
      is_logged_in,
      actions,
      triggers,
      schools,
      schoolPostsAmount
    } = this.props;

    let createPostForm;
    let addedTags;
    if (is_logged_in) {

      if (this.state.form) {
        createPostForm = (
          <CreatePost
            actions={actions}
            allSchools={schools}
            defaultText={this.props.create_post_form.text}
            triggers={triggers}
            userRecentTags={current_user.recent_tags}
            {...this.props.create_post_form}
          />
        );
        addedTags = <AddedTags {...this.props.create_post_form} />;
      }
    }

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
                newPost={this.toggleForm}
                schoolPostsAmount={schoolPostsAmount}
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
                  {createPostForm}
                  {this.props.children}
                </div>
              </PageContent>
              <SidebarAlt>
                {addedTags}
              </SidebarAlt>
            </PageBody>
          </PageMain>
        </Page>

        <Footer/>
      </div>
    );
  }
}
