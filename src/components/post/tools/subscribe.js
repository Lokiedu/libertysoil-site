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

export default class PostSubscribe extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps !== this.props;
  }

  handleToggleSubscription = async (e) => {
    const { postId } = this.props;
    if (e.target.checked) {
      await this.props.onSubscribeToPost(postId);
    } else {
      await this.props.onUnsubscribeFromPost(postId);
    }
  };

  render() {
    if (!this.props.is_logged_in) {
      return false;
    }

    const { subscriptions, postId } = this.props;
    const isSubscribed = subscriptions.includes(postId);

    return (
      <label title="Recieve email notifications about new comments">
        <span className="checkbox__label-left">Subscribe</span>
        <input
          checked={isSubscribed}
          type="checkbox"
          onClick={this.handleToggleSubscription}
        />
      </label>
    );
  }
}
