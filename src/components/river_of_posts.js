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
import React from 'react'
import _ from 'lodash'

import {TextPostComponent} from './post'
import {CreatePost} from './CreatePost'

export default class RiverOfPostsComponent extends React.Component {
  render() {
    if (_.isUndefined(this.props.river)) {
      return <script/>;
    }

    let posts = this.props.river.map(id => this.props.posts[id]);

    return (
      <div>
          { this.props.hide_post_form ? '' : <CreatePost /> }
          {posts.map((post) => <TextPostComponent post={post} author={this.props.users[post.user_id]} key={post.id} current_user={this.props.current_user}/> )}
      </div>
    )
  }
}
