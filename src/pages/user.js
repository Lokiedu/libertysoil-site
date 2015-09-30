import React from 'react';
import { connect } from 'react-redux';
import request from 'superagent';
import _ from 'lodash';

import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Followed from '../components/most_followed_people';
import Tags from '../components/popular_tags'
import Sidebar from '../components/sidebar'
import {API_HOST} from '../config';
import {getStore, addUser, setUserPosts, addError} from '../store';


class FollowButton extends React.Component {
  async followUser(event) {
    event.preventDefault();

    let user = this.props.page_user;

    try {
      let res = await request.post(`${API_HOST}/api/v1/user/${user.username}/follow`);

      if ('user' in res.body) {
        getStore().dispatch(addUser(res.body.user));
      }
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  };

  async unfollowUser(event) {
    event.preventDefault();

    let user = this.props.page_user;

    try {
      let res = await request.post(`${API_HOST}/api/v1/user/${user.username}/unfollow`);

      if ('user' in res.body) {
        getStore().dispatch(addUser(res.body.user));
      }
    } catch (e) {
      getStore().dispatch(addError(e.message));
    }
  };

  render() {
    if (_.isUndefined(this.props.current_user)) {
      return <script/>;  // anonymous
    }

    const current_user = this.props.current_user;
    const page_user = this.props.page_user;

    if (current_user.id === page_user.id) {
      return <script/>;  // do not allow to follow one's self
    }

    let is_followed = (this.props.following.indexOf(page_user.id) != -1);

    if (is_followed) {
      return <button onClick={this.unfollowUser.bind(this)}>Un-Follow</button>;
    } else {
      return <button onClick={this.followUser.bind(this)}>Follow</button>;
    }
  }
}


class UserPage extends React.Component {
  async componentWillMount() {
    let promises = [
      request.get(`${API_HOST}/api/v1/user/${this.props.params.username}`),
      request.get(`${API_HOST}/api/v1/posts/user/${this.props.params.username}`)
    ];

    let results = await* promises;
    getStore().dispatch(addUser(results[0].body));
    getStore().dispatch(setUserPosts(results[1].body));
  }

  render() {
    let current_user;
    if (this.props.is_logged_in) {
      current_user = this.props.users[this.props.current_user];
    }

    let page_user = _.find(this.props.users, {username: this.props.params.username});

    if (_.isUndefined(page_user)) {
      return <script/>;  // not loaded yet
    }

    if (false === page_user) {
      return <NotFound/>
    }

    let user_posts = this.props.user_posts[page_user.id];
    let i_am_following = this.props.following[current_user.id];

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={current_user}/>
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user}/>

            <div className="page__content">
              <div>
                {page_user.username}
                <FollowButton current_user={current_user} page_user={page_user} following={i_am_following}/>
              </div>

              <River river={user_posts} posts={this.props.posts} users={this.props.users}/>
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

function select(state) {
  return state.toJS();
}

export default connect(select)(UserPage);
