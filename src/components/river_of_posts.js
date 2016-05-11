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
import React, {
  Component,
  PropTypes
} from 'react';
import _ from 'lodash';

import * as PostTypes  from '../consts/postTypeConstants';
import { ShortTextPost, PostWrapper } from './post';
import TagLikePost from './tag-like-post';


export default class RiverOfPostsComponent extends Component {
  static propTypes = {
    comments: PropTypes.shape({}).isRequired,
    ui: PropTypes.shape({}).isRequired,
    river: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  render() {
    const {
      triggers,
      current_user,
      users,
      river,
      comments,
      ui
    } = this.props;

    if (_.isUndefined(river)) {
      return <script/>;
    }

    const posts = river.map(id => this.props.posts[id]);

    return (
      <div>
        {posts.map((post) => {
          switch (post.type) {
            case PostTypes.HASHTAG_LIKE:
            case PostTypes.SCHOOL_LIKE:
            case PostTypes.GEOTAG_LIKE:
              return (
                <TagLikePost
                  author={users[post.user_id]}
                  key={post.id}
                  post={post}
                />
              );
            case PostTypes.SHORT_TEXT:
            case PostTypes.LONG_TEXT:
              return (
                <PostWrapper
                  author={users[post.user_id]}
                  current_user={current_user}
                  key={post.id}
                  post={post}
                  comments={comments}
                  ui={ui}
                  triggers={triggers}
                  users={users}
                >
                  <ShortTextPost post={post}/>
                </PostWrapper>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  }
}
