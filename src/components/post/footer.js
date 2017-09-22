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
import PropTypes from 'prop-types';

import React from 'react';

import { Post as PostType } from '../../prop-types/posts';

import TagCloud from '../tag-cloud';
import Toolbar from './toolbar';

export default class PostFooter extends React.Component {
  static propTypes = {
    current_user: PropTypes.shape({}),
    post: PostType,
    triggers: PropTypes.shape({})
  };

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const {
      current_user,
      post,
      triggers
    } = this.props;

    const hasTags = !post.get('geotags').isEmpty() || !post.get('hashtags').isEmpty() || !post.get('schools').isEmpty();

    return (
      <footer className="card__footer">
        {hasTags &&
          <TagCloud tags={post.filter((value, key) => ['geotags', 'hashtags', 'schools'].includes(key))} />
        }

        <div className="card__toolbars layout__grid_item-identical">
          <Toolbar current_user={current_user} post={post} triggers={triggers} />
        </div>
      </footer>
    );
  }
}
