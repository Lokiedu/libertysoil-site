import React from 'react';
import request from 'superagent';
import { connect } from 'react-redux';
import _ from 'lodash';

import ApiClient from '../api/client'
import {getStore, addUser, addError} from '../store';

class FollowButton extends React.Component {
  async followUser(event) {
    event.preventDefault();

    let client = new ApiClient(API_HOST);
    let user = this.props.page_user;

    try {
      let res = await client.follow(user.username);

      if ('user' in res) {
        getStore().dispatch(addUser(res.user));
      }
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  };

  async unfollowUser(event) {
    event.preventDefault();

    let client = new ApiClient(API_HOST);
    let user = this.props.page_user;

    try {
      let res = await client.unfollow(user.username);

      if ('user' in res) {
        getStore().dispatch(addUser(res.user));
      }
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  };

  render() {
    if (_.isUndefined(this.props.active_user)) {
      return <script/>;  // anonymous
    }

    const user = this.props.user;
    const active_user = this.props.active_user;

    if (user.id === active_user.id) {
      return <script/>;  // do not allow to follow one's self
    }

    let is_followed = (this.props.following.indexOf(active_user.id) != -1);

    if (is_followed) {
      return <button className="button button-wide button-yellow" onClick={this.unfollowUser.bind(this)}>Following</button>;
    } else {
      return <button className="button button-wide button-green" onClick={this.followUser.bind(this)}>Follow</button>;
    }
  }
}

function select(state) {
  return state.toJS();
}

export default  connect(select)(FollowButton);
