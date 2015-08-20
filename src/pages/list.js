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
        <div className="page__body">
          <div className="page__sidebar">
            <User currentUser={currentUser} />
            <div className="layout__row">
              <h3 className="head head-sub">Popular tags</h3>
            </div>
            <div className="layout__row">
              <div className="tags">
                <span className="tag">Psychology</span>
                <span className="tag">Gaming</span>
              </div>
            </div>
          </div>
          <div className="page__content">
            <p>This is a List-page!!!!!!!!</p>
            <River/>
            <Followed/>
            <Tags/>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

function select(state) {
  return state;
}

export default connect(select)(Index);
