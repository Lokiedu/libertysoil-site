/*
 This file is a part of libertysoil.org website
 Copyright (C) 2017  Loki Education (Social Enterprise)

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

import ContextualLink from '../../contextual/link';
import Icon from '../../icon';
import { ICON_SIZE } from './config';

export default class PostCommentsTool extends React.PureComponent {
  static propTypes = {
    post: PropTypes.shape({
      comment_count: PropTypes.number.isRequired,
      id: PropTypes.string.isRequired
    }).isRequired
  };

  pushComments = (location) => ({
    ...location,
    query: {
      post_id: this.props.post.get('id'),
      route: 'comments'
    }
  });

  render() {
    const { post } = this.props;

    return (
      <ContextualLink
        altTo={this.pushComments}
        className=""
        to={`/post/${post.get('id')}/comments`}
      >
        <Icon
          className=""
          icon="comments-o"
          outline
          size={ICON_SIZE}
          type="inner"
        />
        {post.get('comment_count') > 0 &&
          <span className="">
            {post.get('comment_count')}
          </span>
        }
      </ContextualLink>
    );
  }
}
