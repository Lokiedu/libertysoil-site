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
import {getStore, addUser, setUserPosts} from '../store';


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
    const current_user = this.props.current_user;

    let page_user = _.find(this.props.users, {username: this.props.params.username});

    if (_.isUndefined(page_user)) {
      return <script/>;  // not loaded yet
    }

    if (false === page_user) {
      return <NotFound/>
    }

    let user_posts = this.props.user_posts[current_user.id];

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={current_user}/>
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user}/>

            <div className="page__content">
              <div>
                {page_user.username}
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
