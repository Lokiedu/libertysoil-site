import React from 'react';
import { connect } from 'react-redux';
import request from 'superagent';

import Header from '../components/header';
import Footer from '../components/footer';
import River from '../components/river_of_posts';
import Followed from '../components/most_followed_people';
import Tags from '../components/popular_tags';
import Sidebar from '../components/sidebar'
import {API_HOST} from '../config';
import {getStore, setPosts} from '../store';


class Index extends React.Component {
  async componentWillMount() {
    let result = await request.get(`${API_HOST}/api/v1/posts`);
    getStore().dispatch(setPosts(result.body));
  }
  render() {
    let current_user = this.props.current_user;

    return (
      <div>
        <Header is_logged_in={this.props.is_logged_in} current_user={current_user} />
        <div className="page__container">
          <div className="page__body">
            <Sidebar current_user={current_user} />

            <div className="page__content">
              <p>This is a List-page!!!!!!!!</p>
              <River posts={this.props.posts} users={this.props.users}/>
              {/*<Followed/> */}
              {/*<Tags/>*/}
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

export default connect(select)(Index);
