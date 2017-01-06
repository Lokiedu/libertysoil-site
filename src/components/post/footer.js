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
import { Link } from 'react-router';

import { URL_NAMES, getUrl } from '../../utils/urlGenerator';
import { Post } from '../../prop-types/posts';
import Time from '../time';
import TagCloud from '../tag-cloud';
import User from '../user';

import Toolbar from './toolbar';
import EditPostButton from './edit-post-button';


class PostFooter extends React.Component {
  static propTypes = {
    author: PropTypes.shape({}),
    current_user: PropTypes.shape({}),
    post: Post,
    triggers: PropTypes.shape({
      subscribeToPost: PropTypes.function,
      unsubscribeFromPost: PropTypes.function
    })
  };

  handleToggleSubscription = async (e) => {
    if (e.target.checked) {
      await this.props.triggers.subscribeToPost(this.props.post.get('id'));
    } else {
      await this.props.triggers.unsubscribeFromPost(this.props.post.get('id'));
    }
  };

  render() {
    const {
      author,
      current_user,
      post,
      triggers
    } = this.props;

    const postUrl = getUrl(URL_NAMES.POST, { uuid: post.get('id') });
    const hasTags = !post.get('geotags').isEmpty() || !post.get('hashtags').isEmpty() || !post.get('schools').isEmpty();
    const isSubscribed = current_user.get('post_subscriptions').includes(post.get('id'));

    return (
      <div>
        <div className="card__meta">
          <div className="card__owner">
            <User avatar={{ size: 39 }} user={author} />
          </div>
          <div className="card__timestamp">
            <Link to={postUrl}>
              <Time timestamp={post.get('created_at')} />
            </Link>
          </div>
        </div>


        {hasTags &&
          <footer className="card__footer">
            <TagCloud tags={post.filter((value, key) => ['geotags', 'hashtags', 'schools'].includes(key))} />
          </footer>
        }

        <footer className="card__footer card__footer-colored">
          <div className="card__toolbars">
            <Toolbar current_user={current_user} post={post} triggers={triggers} />

            <div className="card__toolbar card__toolbar-right">
              {current_user.get('id') &&
                <label
                  className="card__toolbar_item"
                  htmlFor="subscribe_to_post"
                  title="Recieve email notifications about new comments"
                >
                  <span className="checkbox__label-left">Subscribe</span>
                  <input
                    checked={isSubscribed}
                    id="subscribe_to_post"
                    name="subscribe_to_post"
                    type="checkbox"
                    onClick={this.handleToggleSubscription}
                  />
                </label>
              }
              <EditPostButton current_user={current_user} post={post} />
            </div>
          </div>
        </footer>
      </div>
    );
  }
}

export default PostFooter;
