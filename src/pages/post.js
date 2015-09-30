import React from 'react';
import { connect } from 'react-redux';
import request from 'superagent';
import _ from 'lodash';

import NotFound from './not-found'
import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Followed from '../components/most_followed_people';
import Tags from '../components/popular_tags';
import CurrentUser from '../components/current-user';
import { TextPostComponent } from '../components/post'
import {API_HOST} from '../config';
import {getStore, addPost} from '../store';


class PostPage extends React.Component {
  async componentWillMount() {
    try {
      let result = await request.get(`${API_HOST}/api/v1/post/${this.props.params.uuid}`);
      getStore().dispatch(addPost(result.body));
    } catch (e) {
    }
  }

  render() {
    const post_uuid = this.props.params.uuid;

    if (!(post_uuid in this.props.posts)) {
      // not loaded yet
      return <script/>
    }

    const current_post = this.props.posts[post_uuid];

    if (current_post === false) {
      return <NotFound/>
    }

    const author = this.props.users[current_post.user_id]

    let current_user = _.cloneDeep(this.props.users[this.props.current_user]);
    current_user.likes = this.props.likes[this.props.current_user];

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={current_user} />
        <div className="page__container">
          <div className="page__body">
            <div className="page__sidebar">
              <div className="layout__row">
                <CurrentUser user={current_user} />
              </div>
              <div className="layout__row">
                <a href="/">News feed</a>
              </div>
            </div>
            <div className="page__content">
              <TextPostComponent post={current_post} author={author} current_user={current_user} key={current_post.id} fullPost={true} />
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

export default connect(select)(PostPage);
