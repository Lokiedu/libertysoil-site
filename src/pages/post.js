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
import {getStore, setPosts} from '../store';


class PostPage extends React.Component {
  async componentWillMount() {
    let result = await request.get(`${API_HOST}/api/v1/posts`);
    getStore().dispatch(setPosts(result.body));
  }

  render() {
    // FIXME: add check for post existence
    const current_user = this.props.current_user;

    if (this.props.posts.length == 0) {
      return <script/>  // still loading
    }

    const post_uuid = this.props.params.uuid;
    const current_post = _.find(this.props.posts, {id: post_uuid});

    if (!current_post) {
      return <script/>  // 404
    }

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={current_user} />
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />

            <div className="page__content">
              <p>FIXME</p>
              <p>text: "{current_post.text}"</p>
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
