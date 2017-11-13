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
import React from 'react';
import Helmet from 'react-helmet';

import {
  Page,
  PageMain,
  PageBody,
  PageContent
} from '../../components/page';
import CreatePost from '../../components/create-post';
import Header from '../../components/header';
import HeaderLogo from '../../components/header-logo';
import Footer from '../../components/footer';
import LoadableRiver from '../../components/loadable-river';
import Sidebar from '../../components/sidebar';
import SidebarAlt from '../../components/sidebarAlt';
import AddedTags from '../../components/post/added-tags';
import Breadcrumbs from '../../components/breadcrumbs/breadcrumbs';
import ContinentFilter from '../../components/filters/continent-filter';


export default function BestPostsBasePage(props) {
  const {
    current_user,
    create_post_form,
    is_logged_in,
    resetCreatePostForm,
    ui,
    updateCreatePostForm,
    posts,
    comments,
    river,
    users,
    location,
    title,
    onForceLoadPosts,
    loadingInProgress,
    loadMoreLimit,
    triggers,
  } = props;

  const actions = { resetCreatePostForm, updateCreatePostForm };

  return (
    <div>
      <Helmet title={title} />
      <Header current_user={current_user} is_logged_in={is_logged_in}>
        <HeaderLogo />
        <Breadcrumbs title="News Feed" />
      </Header>

      <Page>
        <PageMain>
          <PageBody>
            <Sidebar />
            <PageContent>
              {is_logged_in &&
                <CreatePost
                  actions={actions}
                  addedGeotags={create_post_form.get('geotags')}
                  addedHashtags={create_post_form.get('hashtags')}
                  addedSchools={create_post_form.get('schools')}
                  defaultText={create_post_form.get('text')}
                  triggers={triggers}
                  userRecentTags={current_user.get('recent_tags')}
                />
              }
              <LoadableRiver
                autoload={false}
                comments={comments}
                current_user={current_user}
                loadMoreLimit={loadMoreLimit}
                posts={posts}
                river={river}
                triggers={triggers}
                ui={ui}
                users={users}
                waiting={loadingInProgress}
                onForceLoad={onForceLoadPosts}
              />
            </PageContent>
            <SidebarAlt>
              {is_logged_in &&
                <AddedTags
                  geotags={create_post_form.get('geotags')}
                  hashtags={create_post_form.get('hashtags')}
                  schools={create_post_form.get('schools')}
                  truncated
                />
              }
              <ContinentFilter location={location} />
            </SidebarAlt>
          </PageBody>
        </PageMain>
      </Page>

      <Footer />
    </div>
  );
}
