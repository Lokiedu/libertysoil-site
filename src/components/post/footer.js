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
import { Link } from 'react-router';
import { isEmpty } from 'lodash';
import Time from '../time';

import EditPostButton from './edit-post-button'
import TagLine from './tagline'
import Toolbar from './toolbar'
import User from '../user';
import { URL_NAMES, getUrl } from '../../utils/urlGenerator';

const PostFooter = ({ author, current_user, post, triggers }) => {
  const post_url = getUrl(URL_NAMES.POST, { uuid: post.id });
  const hasTags = !isEmpty(post.geotags) || !isEmpty(post.hashtags) || !isEmpty(post.schools);

  return (
    <div>
      <div className="card__meta">
        <div className="card__owner">
          <User avatarSize="39" user={author} />
        </div>
        <div className="card__timestamp">
          <Link to={post_url}>
            <Time timestamp={post.created_at} />
          </Link>
        </div>
      </div>


      {hasTags &&
        <footer className="card__footer">
          <TagLine geotags={post.geotags} hashtags={post.hashtags} schools={post.schools} />
        </footer>
      }

      <footer className="card__footer card__footer-colored">
        <div className="card__toolbars">
          <Toolbar current_user={current_user} post={post} triggers={triggers} />

          <div className="card__toolbar card__toolbar-right">
            <EditPostButton current_user={current_user} post={post} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PostFooter;
