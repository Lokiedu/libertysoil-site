import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import BaseSchoolPage from './base/school'
import River from '../components/river_of_posts';
import { getStore } from '../store';
import { addSchool, setSchoolPosts } from '../actions';
import { likePost, unlikePost, favPost, unfavPost } from '../triggers'
import { defaultSelector } from '../selectors';

class SchoolPostsPage extends React.Component {
  static displayName = 'SchoolPostsPage';

  static async fetchData(params, props, client) {
    try {
      let schoolInfo = await client.schoolInfo(params.school_name);
      let posts = await client.schoolPosts(schoolInfo.name);

      getStore().dispatch(addSchool(schoolInfo));
      getStore().dispatch(setSchoolPosts(schoolInfo, posts));
    } catch (e) {
      console.log(e.stack)
    }
  }

  render() {
    let triggers = {likePost, unlikePost, favPost, unfavPost};
    let school = _.find(this.props.schools, {url_name: this.props.params.school_name});
    let schoolPosts = this.props.school_posts[school.id];

    return (
      <BaseSchoolPage
        current_user={this.props.current_user}
        is_logged_in={this.props.is_logged_in}
        page_school={school}
      >
        <River
          current_user={this.props.current_user}
          posts={this.props.posts}
          river={schoolPosts}
          triggers={triggers}
          users={this.props.users}
        />
      </BaseSchoolPage>
    );
  }
}

export default connect(defaultSelector)(SchoolPostsPage);
