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
import classNames from 'classnames';

import Dropdown from '../dropdown';
import MenuItem from '../menu-item';
import User from '../user';
import EditPost from './tools/edit-post';
import Subscribe from './tools/subscribe';

const DROPDOWN_ICON = { icon: 'more_vert', size: 'block' };

export default class PostBrief extends React.Component {
  static propTypes = {};

  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  render() {
    const { author, className, current_user, post, triggers } = this.props;

    const userId = current_user.get('id');
    const postId = post.get('id');

    return (
      <div className={classNames('card__meta', className)}>
        <div className="card__owner">
          <User
            avatar={{ isRound: false, size: 32 }}
            text={{ hide: true }}
            user={author}
          />
        </div>
        <div className="card__slug font--family_san-francisco">
          {post.getIn(['more', 'pageTitle'])}
        </div>

        {current_user.get('id') &&
          <Dropdown className="card__toolbar_item" icon={DROPDOWN_ICON}>
            <MenuItem>
              <Subscribe
                is_logged_in={!!userId}
                postId={postId}
                subscriptions={current_user.get('post_subscriptions')}
                onSubscribeToPost={triggers.subscribeToPost}
                onUnsubscribeFromPost={triggers.unsubscribeFromPost}
              />
            </MenuItem>
            <MenuItem>
              <EditPost
                authorId={post.get('user_id')}
                userId={userId}
                postId={postId}
              />
            </MenuItem>
          </Dropdown>
        }
      </div>
    );
  }
}
