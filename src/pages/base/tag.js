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
import { Link, IndexLink } from 'react-router';
import { values } from 'lodash';

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
import TagBreadcrumbs   from '../../components/breadcrumbs/tag-breadcrumbs';
import Footer           from '../../components/footer';
import TagHeader        from '../../components/tag-header/tag-header';
import Sidebar          from '../../components/sidebar';
import SidebarAlt       from '../../components/sidebarAlt';
import AddedTags        from '../../components/post/added-tags';
import { TAG_SCHOOL, TAG_LOCATION, TAG_HASHTAG } from '../../consts/tags';

function formInitialTags(type, value) {
  switch (type) {
    case TAG_SCHOOL:
      return { schools: value };
    case TAG_LOCATION:
      return { hashtags: value };
    case TAG_HASHTAG:
      return { geotags: value };
    default:
      return {};
  }
}

export default class BaseTagPage extends React.Component {
  static displayName = 'BaseTagPage';

  static propTypes = {
    tag: PropTypes.shape({
      name: PropTypes.string
    }).isRequired,
    type: PropTypes.string.isRequired,
    actions: PropTypes.shape({
      resetCreatePostForm: PropTypes.func,
      updateCreatePostForm: PropTypes.func
    }).isRequired
  };

  state = {
    form: false
  };

  postsAmount = null;

  componentWillMount() {
    this.postsAmount = this.props.postsAmount;    
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.form) {
      if (this.postsAmount != nextProps.postsAmount) {
        this.setState({ form: false });
      }
    }
    this.postsAmount = nextProps.postsAmount;
  }

  componentWillUnmount() {
    this.props.actions.resetCreatePostForm();
  }

  toggleForm = () => {
    if (!this.state.form) {
      const { tag, type } = this.props;
      this.props.actions.resetCreatePostForm();
      this.props.actions.updateCreatePostForm(formInitialTags(type, [tag]));
    }

    this.setState({ form: !this.state.form });
  };

  render() {
    const {
      is_logged_in,
      current_user,
      actions,
      triggers,
      type,
      tag,
      postsAmount
    } = this.props;

    let url_name = tag.name;
    if (tag.url_name) {
      url_name = tag.url_name;
    }

    let createPostForm;
    let addedTags;
    if (is_logged_in) {
      if (this.state.form) {
        createPostForm = (
          <CreatePost
            actions={actions}
            allSchools={values(this.props.schools)}
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
          <TagBreadcrumbs type={type} tag={tag} />
        </Header>

        <Page>
          <Sidebar current_user={current_user} />
          <PageMain className="page__main-no_space">
            <PageCaption>
              {tag.name}
            </PageCaption>
            <PageHero src="/images/hero/welcome.jpg" />
            <PageBody className="page__body-up">
              <TagHeader
                is_logged_in={is_logged_in}
                tag={tag}
                type={type}
                current_user={current_user}
                triggers={triggers}
                newPost={this.toggleForm}
                postsAmount={postsAmount}
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
                        to={`/s/${url_name}`}
                      >
                        About
                      </IndexLink>
                    </div>
                    <div className="layout__grid_item">
                      <Link
                        activeClassName="tabs__link-active"
                        className="tabs__link"
                        to={`/s/${url_name}/edit`}
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
