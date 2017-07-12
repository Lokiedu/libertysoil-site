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
import { Link } from 'react-router';

import { URL_NAMES, getUrl } from '../../utils/urlGenerator';

import { OldIcon as Icon } from '../icon';
import Time from '../time';
import PostFav from './tools/fav';
import PostLike from './tools/like';
import { ICON_SIZE } from './tools/config';

export default class Toolbar extends React.Component {
  static displayName = 'post-toolbar';
  static propTypes = {
    current_user: React.PropTypes.shape({}),
    post: React.PropTypes.shape({
      id: React.PropTypes.string.isRequired,
      user_id: React.PropTypes.string.isRequired
    })
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { current_user, post, triggers } = this.props;

    const postId = post.get('id');
    const authorId = post.get('user_id');
    const postUrl = getUrl(URL_NAMES.POST, { uuid: postId });

    return (
      <div className="card__toolbar">
        <Link className="layout layout-align_vertical" to={postUrl}>
          <div className="card__timestamp">
            <Time timestamp={post.get('created_at')} />
          </div>
        </Link>
        <div className="card__toolbar--group card__toolbar_item--right">
          <Link className="layout layout-align_vertical card__toolbar_item" to={postUrl}>
            <Icon icon="link" size={ICON_SIZE} />
          </Link>
          <PostFav
            authorId={authorId}
            current_user={current_user}
            postId={postId}
            triggers={triggers}
          />
          <PostLike
            authorId={authorId}
            current_user={current_user}
            postId={postId}
            triggers={triggers}
          />
        </div>
      </div>
    );
  }
}
