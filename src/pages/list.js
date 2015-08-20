import React from 'react';
import {Link} from 'react-router';
import { connect } from 'react-redux';

import Header from '../components/header';
import Footer from '../components/footer';
import User from '../components/current_user';
import River from '../components/river_of_posts';
import Followed from '../components/most_followed_people';
import Tags from '../components/popular_tags';

class Index extends React.Component {
  render() {
    let currentUser = this.props.users[0];

    return (
      <div>
        <Header currentUser={currentUser} />
        <Link to="/auth">go to auth</Link>
        <User currentUser={currentUser} />
        <hr/>
        <p>This is a List-page</p>
        <hr/>
        <River/>
        <Followed/>
        <Tags/>
        <Footer/>
      </div>
    )
  }
}

function select(state) {
  return state;
}

export default connect(select)(Index);
